package application

import (
	"database/sql"
	"github.com/killedbymemory/bosen/backend/session"
	"github.com/killedbymemory/bosen/backend/user"
	"github.com/labstack/echo"
)

var (
	userRepository    *user.UserRepository       = nil
	sessionRepository *session.SessionRepository = nil
)

type ApplicationContext struct {
	echo.Context      // This is called "Embedded Field". go look it up.
	UserRepository    *user.UserRepository
	SessionRepository *session.SessionRepository
}

func NewApplicationContext(context echo.Context, db *sql.DB) *ApplicationContext {
	if userRepository == nil {
		userRepository = user.NewUserRepository(db)
	}

	if sessionRepository == nil {
		sessionRepository = session.NewSessionRepository(db)
	}

	return &ApplicationContext{
		Context:           context, // This is how to set "Embedded Field"
		UserRepository:    userRepository,
		SessionRepository: sessionRepository,
	}
}

func (appContext *ApplicationContext) GetUserRepository() *user.UserRepository {
	return appContext.UserRepository
}

func (appContext *ApplicationContext) GetSessionRepository() *session.SessionRepository {
	return appContext.SessionRepository
}
