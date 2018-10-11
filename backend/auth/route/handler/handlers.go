package handler

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/killedbymemory/bosen/backend/application"
	AuthHelper "github.com/killedbymemory/bosen/backend/auth/helper"
	"github.com/killedbymemory/bosen/backend/model"
	"github.com/labstack/echo"
	"github.com/satori/go.uuid"
	"net/http"
	"time"
)

func AuthenticateSession(context echo.Context) error {
	sessionId, err := uuid.FromString(context.Param("sessionId"))

	if err != nil {
		return err
	}

	credentials := new(model.UserCredentials)

	if err := context.Bind(credentials); err != nil {
		return err
	}

	criteria := map[string]string{
		"username": credentials.Username,
	}

	appContext := context.(*application.ApplicationContext)
	user, err := appContext.GetUserRepository().FindOne(criteria)

	switch {
	case err != nil:
		return err
	case user == nil:
		return echo.ErrUnauthorized
	}

	if ok := AuthHelper.CheckPasswordHash(user.Password, credentials.Password); !ok {
		return echo.ErrUnauthorized
	}

	// Create token
	// Source: https://github.com/labstack/echox/blob/master/cookbook/jwt/map-claims/server.go
	token := jwt.New(jwt.SigningMethodHS256)

	// Set claims
	claims := token.Claims.(jwt.MapClaims)
	claims["user.uid"] = user.Uid
	claims["user.sessionId"] = sessionId
	claims["expiration"] = time.Now().Add(time.Hour * 24 * 7).Unix()

	// Generate encoded token and send it as response
	// Secret are generated using combined result of https://www.random.org/passwords/?num=5&len=24&format=plain&rnd=new
	tokenString, err := token.SignedString([]byte("seqCEeCMUK8cd4RjMaARwqf8XnuZqkL567FysqRvZJyMTkM3H9uztKtykqtSJkqVNFhnERva"))

	if err != nil {
		return err
	}

	return context.JSON(http.StatusOK, model.UserAuthenticationPage{Data: model.Token{Token: tokenString}})
}

func InspectToken(context echo.Context) error {
	// By default, Echo's JWT middleware store token's information under "user"  key
	token := context.Get("user").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	uid := claims["user.uid"].(string)
	sessionId := claims["user.sessionId"].(string)
	expiration := claims["expiration"].(float64)

	return context.JSON(http.StatusOK, struct {
		Uid        string
		SessionId  string
		Expiration float64
	}{
		Uid:        uid,
		SessionId:  sessionId,
		Expiration: expiration,
	})
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
