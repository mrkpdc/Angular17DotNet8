# Wait to be sure that SQL Server came up
# Run the setup script to create the DB and the schema in the DB
# Note: make sure that your password matches what is in the Dockerfile
sleep 10s & /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Password01! -d master -i AuthDB_SQLServer.sql