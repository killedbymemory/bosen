package handler

import (
	"net/http"

	"fmt"
	"github.com/killedbymemory/cms/backend/application"
	AuthHelper "github.com/killedbymemory/cms/backend/auth/helper"
	"github.com/killedbymemory/cms/backend/model"
	"github.com/labstack/echo"
	"github.com/satori/go.uuid"
)

func GetUserInfo(context echo.Context) error {
	appContext := context.(*application.ApplicationContext)

	var user *model.User
	userIdentifier := context.Param("uid")
	uid, err := uuid.FromString(userIdentifier)

	if err == nil {
		user, err = appContext.GetUserRepository().FindById(uid)
	} else {
		user, err = appContext.GetUserRepository().FindByUsername(userIdentifier)
	}

	switch {
	case err != nil:
		return err
	case user == nil:
		return context.NoContent(http.StatusNotFound)
	default:
		return context.JSON(http.StatusOK, user)
	}
}

func ListUsers(context echo.Context) error {
	appContext := context.(*application.ApplicationContext)
	users, err := appContext.GetUserRepository().FindAll()

	if err != nil {
		return err
	}

	return context.JSON(http.StatusOK, model.UserListPage{Data: users})
}

func CreateNewUser(context echo.Context) error {
	uid, err := uuid.FromString(context.Param("uid"))

	if err != nil {
		return err
	}

	newUser := new(model.User)

	if err := context.Bind(newUser); err != nil {
		return err
	}

	newUser.Uid = uid
	newUser.Password, err = AuthHelper.HashPassword(newUser.Password)

	if err != nil {
		return nil
	}

	appContext := context.(*application.ApplicationContext)

	user, err := appContext.GetUserRepository().FindById(uid)

	if err != nil {
		return err
	}

	if user != nil {
		fmt.Println("User already exists in database:", uid)

		// User already exists, update its information
		return context.JSON(http.StatusBadRequest, struct {
			Message string `json:"message"`
		}{
			Message: "User identifier already exist",
		})
	}

	if err := appContext.GetUserRepository().Add(newUser); err != nil {
		return err
	}

	return context.JSON(http.StatusCreated, newUser)
}

func UpdateUserInfo(context echo.Context) error {
	uid, err := uuid.FromString(context.Param("uid"))

	if err != nil {
		return err
	}

	supplied := new(model.User)

	if err = context.Bind(supplied); err != nil {
		return err
	}

	appContext := context.(*application.ApplicationContext)
	user, err := appContext.GetUserRepository().FindById(uid)

	if err != nil {
		return err
	}

	if user == nil {
		return context.NoContent(http.StatusNotFound)
	}

	changedFields := make(map[string]interface{})

	if supplied.Username != "" {
		changedFields["username"] = supplied.Username
	}

	if supplied.Password != "" {
		changedFields["password"] = supplied.Password
	}

	if supplied.FirstName != nil {
		changedFields["firstName"] = supplied.FirstName
	}

	if supplied.MiddleName != nil {
		changedFields["middleName"] = supplied.MiddleName
	}

	if supplied.LastName != nil {
		changedFields["lastName"] = supplied.LastName
	}

	if password, ok := changedFields["password"]; ok {
		// Probably not neccessary since it's computationaly expensive
		if AuthHelper.CheckPasswordHash(supplied.Password, password.(string)) {
			fmt.Println("Old hashed password matched with new password")
			delete(changedFields, "password")
		} else {
			if hashedPassword, err := AuthHelper.HashPassword(password.(string)); err == nil {
				changedFields["password"] = hashedPassword
			}
		}
	}

	err = appContext.GetUserRepository().Edit(user, changedFields)

	if err != nil {
		return err
	}

	user, err = appContext.GetUserRepository().FindById(uid)

	if err != nil {
		return err
	}

	return context.JSON(http.StatusOK, user)
}

func DeleteUser(context echo.Context) error {
	uid, err := uuid.FromString(context.Param("uid"))

	if err != nil {
		return err
	}

	appContext := context.(*application.ApplicationContext)
	user, err := appContext.GetUserRepository().FindById(uid)

	if err != nil {
		return err
	}

	if user != nil {
		user, err = appContext.GetUserRepository().Delete(user)

		if err != nil {
			return err
		}

		return context.JSON(http.StatusOK, user)
	}

	return context.NoContent(http.StatusOK)
}

func ChangeUserPassword(context echo.Context) error {
	uid, err := uuid.FromString(context.Param("uid"))

	if err != nil {
		return err
	}

	userCredentials := new(model.UserCredentials)

	if err = context.Bind(userCredentials); err != nil {
		return err
	}

	appContext := context.(*application.ApplicationContext)
	user, err := appContext.GetUserRepository().FindById(uid)

	if user == nil {
		return context.NoContent(http.StatusNotFound)
	}

	changedFields := make(map[string]interface{})

	oldPassword := userCredentials.OldPassword
	newPassword := userCredentials.NewPassword

	if AuthHelper.CheckPasswordHash(user.Password /* hashed */, oldPassword /* plain */) {
		fmt.Println("Stored hashed password matched with supplied old password")

		if hashedPassword, err := AuthHelper.HashPassword(newPassword); err == nil {
			changedFields["password"] = hashedPassword
		}
	} else {
		fmt.Println("Stored hashed password does not matched with supplied old password")
		return echo.ErrUnauthorized
	}

	if err != nil {
		return err
	}

	err = appContext.GetUserRepository().Edit(user, changedFields)

	if err != nil {
		return err
	}

	user, err = appContext.GetUserRepository().FindById(uid)

	if err != nil {
		return err
	}

	return context.JSON(http.StatusOK, user)
}
