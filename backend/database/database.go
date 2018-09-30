package database

import (
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
)

var connections = make(map[string]*sql.DB)

func NewDBConnection(connectionName, dbUsername, dbPassword, dbHost string, dbPort int, dbName string) (*sql.DB, error) {
	connectionString := fmt.Sprintf("user=%s password=%s host=%s port=%d dbname=%s sslmode=%s", dbUsername, dbPassword, dbHost, dbPort, dbName, "disable")
	db, err := sql.Open("postgres", connectionString)

	if err != nil {
		return nil, err
	}

	connections[connectionName] = db
	return db, nil
}

func GetDBConnection(connectionName string) *sql.DB {
	return connections[connectionName]
}
