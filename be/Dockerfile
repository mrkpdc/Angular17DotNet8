#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
#nella 6 esponeva la 80, la 8 espone la 8080..
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["be.csproj", "./"]
RUN dotnet restore "be.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "be.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "be.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
#ENTRYPOINT ["dotnet", "be.dll"]
#questo sotto va bene per aspettare che eventualmente salga il db.. con sql server
#serviva.. con postgres non ho mai avuto problemi
ENTRYPOINT ["/bin/sh", "-c", "echo 'Waiting 30s for db..' && sleep 30s && echo 'Waited 30s for db' && dotnet be.dll"]