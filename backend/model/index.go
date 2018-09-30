package model

import (
	"github.com/labstack/echo"
	"github.com/satori/go.uuid"
)

type Route struct {
	Method     string
	Path       string
	Handler    echo.HandlerFunc
	Restricted bool
}

type Routes map[string]Route
type RequestHandlers map[string]Route

type User struct {
	Uid        uuid.UUID `json:"uid" form:"uid"`
	Username   string    `json:"username" form:"username"`
	Password   string    `json:"password" form:"password"`
	FirstName  *string   `json:"firstName" form:"firstName"`
	MiddleName *string   `json:"middleName" form:"middleName"`
	LastName   *string   `json:"lastName" form:"lastName"`
}

type UserListPage struct {
	Data []User `json:"data"`
}

type Repository interface {
	FindAll() ([]interface{}, error)
}

type Session struct {
	Uid uuid.UUID `json:"uid" form:"uid"`
}

type SessionListPage struct {
	Data []Session `json:"data"`
}

type UserCredentials struct {
	Username    string `json:"username" form:"username"`
	Password    string `json:"password" form:"password"`
	OldPassword string `json:"oldPassword" form:"oldPassword"`
	NewPassword string `json:"newPassword" form:"newPassword"`
	SessionId   uuid.UUID
}

type Token struct {
	Token string `json:"token"`
}

type UserAuthenticationPage struct {
	Data Token `json:"data"`
}
