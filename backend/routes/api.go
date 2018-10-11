package routes

import (
	AuthRouteHandler "github.com/killedbymemory/bosen/backend/auth/route/handler"
	"github.com/killedbymemory/bosen/backend/model"
	SessionRouteHandler "github.com/killedbymemory/bosen/backend/session/route/handler"
	UserRouteHandler "github.com/killedbymemory/bosen/backend/user/route/handler"
)

type RouteGroup struct{}

var API = RouteGroup{}

func (r RouteGroup) RegisterRoutes(fn func(model.Routes)) {
	routes := model.Routes{
		"get-users": model.Route{
			Method:  "GET",
			Path:    "/users",
			Handler: UserRouteHandler.ListUsers,
		},
		"create-user": model.Route{
			Method:  "PUT",
			Path:    "/users/:uid",
			Handler: UserRouteHandler.CreateNewUser,
		},
		"edit-user": model.Route{
			Method:  "POST",
			Path:    "/users/:uid",
			Handler: UserRouteHandler.UpdateUserInfo,
		},
		"detail-user": model.Route{
			Method:  "GET",
			Path:    "/users/:uid",
			Handler: UserRouteHandler.GetUserInfo,
		},
		"delete-user": model.Route{
			Method:  "DELETE",
			Path:    "/users/:uid",
			Handler: UserRouteHandler.DeleteUser,
		},
		"change-user-password": model.Route{
			Method:     "POST",
			Path:       "/users/:uid/password",
			Handler:    UserRouteHandler.ChangeUserPassword,
			Restricted: true,
		},

		// Session
		"get-sessions": model.Route{
			Method:  "GET",
			Path:    "/sessions",
			Handler: SessionRouteHandler.ListSessions,
		},
		"create-session": model.Route{
			Method:  "PUT",
			Path:    "/sessions/:uid",
			Handler: SessionRouteHandler.CreateNewSession,
		},
		"edit-session": model.Route{
			Method:  "POST",
			Path:    "/sessions/:uid",
			Handler: SessionRouteHandler.UpdateSessionInfo,
		},
		"detail-session": model.Route{
			Method:  "GET",
			Path:    "/sessions/:uid",
			Handler: SessionRouteHandler.GetSessionInfo,
		},
		"delete-session": model.Route{
			Method:  "DELETE",
			Path:    "/sessions/:uid",
			Handler: SessionRouteHandler.DeleteSession,
		},

		// Auth
		"authenticate-session": model.Route{
			Method:  "POST",
			Path:    "/auth/authenticate/:sessionId",
			Handler: AuthRouteHandler.AuthenticateSession,
		},
		"inspect-token": model.Route{
			Method:     "GET",
			Path:       "/auth/token",
			Handler:    AuthRouteHandler.InspectToken,
			Restricted: true,
		},
	}

	fn(routes)
}
