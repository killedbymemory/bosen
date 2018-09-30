package handler

import (
	"github.com/killedbymemory/cms/backend/application"
	"github.com/killedbymemory/cms/backend/model"
	"github.com/labstack/echo"
	"github.com/satori/go.uuid"
	"net/http"
)

func GetSessionInfo(context echo.Context) error {
	uid, err := uuid.FromString(context.Param("uid"))

	if err != nil {
		return err
	}

	appContext := context.(*application.ApplicationContext)
	user, err := appContext.GetSessionRepository().FindById(uid)

	switch {
	case err != nil:
		return err
	case user == nil:
		return context.NoContent(http.StatusNotFound)
	default:
		return context.JSON(http.StatusOK, user)
	}
}

func ListSessions(context echo.Context) error {
	appContext := context.(*application.ApplicationContext)
	sessions, err := appContext.GetSessionRepository().FindAll()

	if err != nil {
		return err
	}

	return context.JSON(http.StatusOK, model.SessionListPage{Data: sessions})
}

func CreateNewSession(context echo.Context) error {
	uid, err := uuid.FromString(context.Param("uid"))

	if err != nil {
		return err
	}

	newSession := new(model.Session)

	if err := context.Bind(newSession); err != nil {
		return err
	}

	newSession.Uid = uid
	appContext := context.(*application.ApplicationContext)

	session, err := appContext.GetSessionRepository().FindById(uid)

	if err != nil {
		return err
	}

	if session != nil {
		// Session already exists, renew it
		return UpdateSessionInfo(context)
	}

	if err := appContext.GetSessionRepository().Add(newSession); err != nil {
		return err
	}

	return context.JSON(http.StatusCreated, newSession)
}

func UpdateSessionInfo(context echo.Context) error {
	uid, err := uuid.FromString(context.Param("uid"))

	if err != nil {
		return err
	}

	appContext := context.(*application.ApplicationContext)
	session, err := appContext.GetSessionRepository().FindById(uid)

	if err != nil {
		return err
	}

	if session == nil {
		return context.NoContent(http.StatusNotFound)
	}

	changedFields := map[string]interface{}{
		"uid": uid,
	}

	err = appContext.GetSessionRepository().Edit(session, changedFields)

	if err != nil {
		return err
	}

	session, err = appContext.GetSessionRepository().FindById(uid)

	if err != nil {
		return err
	}

	return context.JSON(http.StatusOK, session)
}

func DeleteSession(context echo.Context) error {
	uid, err := uuid.FromString(context.Param("uid"))

	if err != nil {
		return err
	}

	appContext := context.(*application.ApplicationContext)
	session, err := appContext.GetSessionRepository().FindById(uid)

	if err != nil {
		return err
	}

	if session != nil {
		session, err = appContext.GetSessionRepository().Delete(session)

		if err != nil {
			return err
		}

		return context.JSON(http.StatusOK, session)
	}

	return context.NoContent(http.StatusOK)
}
