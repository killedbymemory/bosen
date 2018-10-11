package main

import (
	"github.com/killedbymemory/bosen/backend/application"
	"github.com/killedbymemory/bosen/backend/database"
	"github.com/killedbymemory/bosen/backend/model"
	"github.com/killedbymemory/bosen/backend/routes"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

func main() {
	e := echo.New()

	const (
		DB_USER     = "cmsuser"
		DB_PASSWORD = "password"
		DB_NAME     = "cms"
		DB_HOST     = "localhost"
		DB_PORT     = 5432
	)

	if _, err := database.NewDBConnection("postgres", DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME); err != nil {
		panic(err)
	}

	db := database.GetDBConnection("postgres")
	defer db.Close()

	// Allow requests from any origin
	// See: https://github.com/labstack/echox/blob/master/cookbook/cors/server.go
	e.Use(middleware.CORS())

	e.Use(func(handler echo.HandlerFunc) echo.HandlerFunc {
		return func(context echo.Context) error {
			appContext := application.NewApplicationContext(context, db)
			return handler(appContext)
		}
	})

	secret := []byte("seqCEeCMUK8cd4RjMaARwqf8XnuZqkL567FysqRvZJyMTkM3H9uztKtykqtSJkqVNFhnERva")
	JWTMiddleware := middleware.JWT(secret)

	routes.API.RegisterRoutes(func(routes model.Routes) {
		for routeName, route := range routes {
			if route.Restricted {
				// Restricted route reference implementation (minus echo.Group)
				// See: https://github.com/labstack/echox/blob/master/cookbook/jwt/map-claims/server.go#L43
				switch route.Method {
				case "GET":
					e.GET(route.Path, route.Handler, JWTMiddleware).Name = routeName
				case "POST":
					e.POST(route.Path, route.Handler, JWTMiddleware).Name = routeName
				case "PUT":
					e.PUT(route.Path, route.Handler, JWTMiddleware).Name = routeName
				case "DELETE":
					e.DELETE(route.Path, route.Handler, JWTMiddleware).Name = routeName
				}

				continue
			}

			switch route.Method {
			case "GET":
				e.GET(route.Path, route.Handler).Name = routeName
			case "POST":
				e.POST(route.Path, route.Handler).Name = routeName
			case "PUT":
				e.PUT(route.Path, route.Handler).Name = routeName
			case "DELETE":
				e.DELETE(route.Path, route.Handler).Name = routeName
			}
		}
	})

	e.Logger.Fatal(e.Start(":8080"))
}
