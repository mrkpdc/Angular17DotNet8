using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Reflection;
using System.Text.Json;

namespace be.Helpers
{
    public static class DynamicLinqHelper
    {
        private static class DynamicLinqHelperFormat
        {
            public static Dictionary<string, string> Formats = new Dictionary<string, string>() {
                {"eq", "{0} == @0" },
                {"neq", "{0} != @0" },
                {"isnull", "{0} == null" },
                {"isnotnull", "{0} != null" },
                {"startswith", "{0} != null && {0}.ToLower().StartsWith(@0.ToLower())" },
                {"endswith", "{0} != null && {0}.ToLower().EndsWith(@0.ToLower())" },
                {"contains", "{0} != null && {0}.ToLower().Contains(@0.ToLower())" },
                {"doesnotcontain", "{0} != null && !{0}.ToLower().Contains(@0.ToLower())" },
                {"isempty", "{0} == string.Empty" },
                {"isnotempty","{0} != string.Empty" },
                {"lt","{0} != null && {0} < @0" },
                {"lte","{0} != null && {0} <= @0" },
                {"gt","{0} != null && {0} > @0" },
                {"gte","{0} != null && {0} >= @0" }
            };
        }

        private class DynamicFormattedFilter
        {
            public string? Conjunction { get; set; }
            public string? Condition1 { get; set; }
            public string? Value1 { get; set; }
            public string? Condition2 { get; set; }
            public string? Value2 { get; set; }
        }

        private static Dictionary<string, DynamicFormattedFilter?> GetFormattedFilters(object filterJson)
        {
            var filterList = ((JsonElement)filterJson).EnumerateObject().ToList();
            Dictionary<string, DynamicFormattedFilter?> filters = new Dictionary<string, DynamicFormattedFilter?>();
            for (int i = 0; i < filterList.Count; i++)
            {
                var filter = GetNestedFilter(new List<KeyValuePair<string, DynamicFormattedFilter?>>(), filterList[i].Value, filterList[i].Name);
                foreach (var item in filter)
                    filters.Add(item.Key, item.Value);
            }
            return filters;
        }
        private static List<KeyValuePair<string, DynamicFormattedFilter?>> GetNestedFilter(List<KeyValuePair<string, DynamicFormattedFilter?>> toSender, JsonElement element, string filterPath)
        {
            /*
             quando si scende troppo in profondità il valuekind è String, quindi non si può fare l'EnumerateObject e si spacca,
             quindi controllo prima di tutto che sia enumerabile
             */
            if (element.ValueKind == JsonValueKind.Object)
            {
                var nestedItems = element.EnumerateObject().ToList();
                for (int i = 0; i < nestedItems.Count; i++)
                    GetNestedFilter(toSender, nestedItems[i].Value, filterPath + "." + nestedItems[i].Name);
                toSender.Add(
                 new KeyValuePair<string, DynamicFormattedFilter?>(
                     filterPath,
                     JsonSerializer.Deserialize<DynamicFormattedFilter>(element.ToString(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true }))
                 );
            }
            return toSender;
        }

        public static (int TotalItemsCount, List<T> Items) GetItemsWithFilter<T>(IQueryable<T> dataSet,
            object filterJson,
            string? orderBy = null,
            bool? orderByIsDesc = null,
            int? currentPage = null,
            int? pageSize = null)
        {
            if (filterJson != null)
            {
                Dictionary<string, DynamicFormattedFilter?> filters = GetFormattedFilters(filterJson);

                foreach (KeyValuePair<string, DynamicFormattedFilter?> kvp in filters)
                {
                    List<string> subQueries = new List<string>();
                    List<object> filterValues = new List<object>();
                    int filterIndex = 0;
                    var currentFilter = kvp;

                    string linqQuery = string.Empty;
                    if (currentFilter.Value?.Condition1 != null)//&& currentFilter.Value.Value1 != null)
                    {
                        List<string> propertyNames = new List<string>();
                        PropertyInfo? property = GetPropertyFromTypes(currentFilter.Key, dataSet, propertyNames);
                        if (property != null && DynamicLinqHelperFormat.Formats.ContainsKey(currentFilter.Value.Condition1.ToLowerInvariant()))
                        {
                            linqQuery = "(" + string.Format(DynamicLinqHelperFormat.Formats[currentFilter.Value.Condition1.ToLowerInvariant()].Replace("@0", "@" + filterIndex), "np(" + string.Join(".", propertyNames) + ")") + ")";
                            filterValues.Add(currentFilter.Value.Value1 == null ? string.Empty : currentFilter.Value.Value1);
                            filterIndex++;
                            if (currentFilter.Value.Conjunction != null
                            && currentFilter.Value.Condition2 != null
                            /*&& currentFilter.Value.Value2 != null*/)
                            {
                                if (DynamicLinqHelperFormat.Formats.ContainsKey(currentFilter.Value.Condition2.ToLowerInvariant()))
                                {
                                    linqQuery += " " + currentFilter.Value.Conjunction + " (" + string.Format(DynamicLinqHelperFormat.Formats[currentFilter.Value.Condition2.ToLowerInvariant()].Replace("@0", "@" + filterIndex), "np(" + string.Join(".", propertyNames) + ")") + ")";
                                    filterValues.Add(currentFilter.Value.Value2 == null ? string.Empty : currentFilter.Value.Value2);
                                    filterIndex++;
                                }
                            }
                        }
                    }
                    if (linqQuery != string.Empty)
                        dataSet = dataSet.Where(linqQuery, filterValues.ToArray());
                }
            }
            if (orderBy != null)
            {
                List<string> propertyNames = new List<string>();
                PropertyInfo? property = GetPropertyFromTypes(orderBy, dataSet, propertyNames);
                if (property != null)
                {
                    if (orderByIsDesc == true)
                        dataSet = dataSet.OrderBy(string.Format("{0} desc", "np(" + string.Join(".", propertyNames) + ")"));
                    else
                        dataSet = dataSet.OrderBy("np(" + string.Join(".", propertyNames) + ")");
                }
            }
            int totalItemsCount = dataSet.Count();
            if (pageSize != null)
            {
                if (currentPage != null)
                    dataSet = dataSet.Skip((currentPage.Value - 1) * pageSize.Value);
                dataSet = dataSet.Take(pageSize.Value);
            }
            return (
                TotalItemsCount: totalItemsCount,
                Items: dataSet.ToList()
                );
        }

        private static PropertyInfo? GetPropertyFromTypes<T>(string typesString, IQueryable<T> query, List<string> propertyNames)
        {
            string[] types = typesString.Split(".");
            PropertyInfo? property = null;
            Type entityType = query.GetType();
            for (int i = 0; i < types.Length; i++)
            {
                if (entityType.GetGenericArguments().Count() > 0)
                    property = entityType.GetGenericArguments()[0].GetProperty(types[i], BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
                else
                    property = entityType.GetProperty(types[i], BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
                if (property != null)
                {
                    propertyNames.Add(property.Name);
                    entityType = property.PropertyType;
                }
            }
            return property;
        }
    }
}