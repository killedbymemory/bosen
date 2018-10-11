package user

import (
	"database/sql"
	"fmt"
	"github.com/killedbymemory/bosen/backend/model"
	"github.com/satori/go.uuid"
	"strings"
)

type UserRepository struct {
	DB *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{DB: db}
}

func (repository *UserRepository) GetDatabase() *sql.DB {
	return repository.DB
}

func (repository *UserRepository) FindById(uid uuid.UUID) (*model.User, error) {
	db := repository.GetDatabase()

	query := "SELECT username, password, firstName, middleName, lastName FROM userinfo WHERE uid = $1"
	statement, err := db.Prepare(query)

	if err != nil {
		return nil, err
	}

	var username, password, firstName, middleName, lastName string

	dest := []interface{}{
		&username,
		&password,
		&firstName,
		&middleName,
		&lastName,
	}

	if err = statement.QueryRow(uid).Scan(dest...); err != nil {
		switch err {
		case sql.ErrNoRows:
			// User not found is not an error
			return nil, nil
		default:
			return nil, err
		}
	}

	user := &model.User{
		Uid:        uid,
		Username:   username,
		Password:   password,
		FirstName:  &firstName,
		MiddleName: &middleName,
		LastName:   &lastName,
	}

	return user, nil
}

func (repository *UserRepository) FindByUsername(username string) (*model.User, error) {
	db := repository.GetDatabase()

	query := "SELECT uid, username, password, firstName, middleName, lastName FROM userinfo WHERE username = $1 limit 1"
	statement, err := db.Prepare(query)

	if err != nil {
		return nil, err
	}

	var uid uuid.UUID
	var _username, password, firstName, middleName, lastName string

	dest := []interface{}{
		&uid,
		&_username,
		&password,
		&firstName,
		&middleName,
		&lastName,
	}

	if err = statement.QueryRow(username).Scan(dest...); err != nil {
		switch err {
		case sql.ErrNoRows:
			// User not found is not an error
			return nil, nil
		default:
			return nil, err
		}
	}

	user := &model.User{
		Uid:        uid,
		Username:   _username,
		Password:   password,
		FirstName:  &firstName,
		MiddleName: &middleName,
		LastName:   &lastName,
	}

	return user, nil
}

func (repository *UserRepository) FindAll() ([]model.User, error) {
	rows, err := repository.GetDatabase().Query("SELECT uid, username, firstName, middleName, lastName FROM userinfo")

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var users []model.User

	for rows.Next() {
		var uid uuid.UUID
		var username, firstName, middleName, lastName string
		dest := []interface{}{
			&uid,
			&username,
			&firstName,
			&middleName,
			&lastName,
		}

		if err = rows.Scan(dest...); err != nil {
			return nil, err
		}

		users = append(users, model.User{
			Uid:        uid,
			Username:   username,
			FirstName:  &firstName,
			MiddleName: &middleName,
			LastName:   &lastName,
		})
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func (repository *UserRepository) Add(user *model.User) error {
	db := repository.GetDatabase()

	// In Postgresql, prepared statement parameter placeholder use $1, $2, ..., $n notation
	statement, err := db.Prepare(`
            INSERT INTO userinfo
            (uid, username, password, firstName, middleName, lastName)
            VALUES ($1, $2, $3, $4, $5, $6)
        `)

	if err != nil {
		return err
	}

	defer statement.Close()

	if _, err := statement.Exec(user.Uid, user.Username, user.Password, user.FirstName, user.MiddleName, user.LastName); err != nil {
		return err
	}

	return nil
}

func (repository *UserRepository) Edit(user *model.User, changedFields map[string]interface{}) error {
	db := repository.GetDatabase()

	var updatedFields []string
	values := []interface{}{
		user.Uid,
	}

	index := 2 // Since $1 is reserved for user's uid
	for key, value := range changedFields {
		updatedFields = append(updatedFields, fmt.Sprintf("%s=$%d", key, index))
		values = append(values, value)
		index++
	}

	query := fmt.Sprintf("UPDATE userinfo SET %s WHERE uid = $1", strings.Join(updatedFields, ", "))
	statement, err := db.Prepare(query)

	if err != nil {
		return err
	}

	defer statement.Close()

	if _, err := statement.Exec(values...); err != nil {
		return err
	}

	return nil
}

func (repository *UserRepository) Delete(user *model.User) (*model.User, error) {
	db := repository.GetDatabase()

	query := "DELETE FROM userinfo WHERE uid = $1"
	statement, err := db.Prepare(query)

	if err != nil {
		return user, err
	}

	defer statement.Close()

	if _, err := statement.Exec(user.Uid); err != nil {
		return user, err
	}

	return user, nil
}

type UserCriteria map[string]string

func (repository *UserRepository) FindOne(criteria UserCriteria) (*model.User, error) {
	db := repository.GetDatabase()
	query := "SELECT uid, username, password FROM userinfo"

	where := make([]string, 0)
	values := make([]interface{}, 0)
	index := 1

	for field, value := range criteria {
		where = append(where, fmt.Sprintf("%s=$%d", field, index))
		values = append(values, value)
		index++
	}

	if len(where) > 0 {
		query += " WHERE " + strings.Join(where, " AND ")
	}
	query += " LIMIT 1"

	fmt.Println(query)
	fmt.Println(values)

	statement, err := db.Prepare(query)

	if err != nil {
		return nil, err
	}

	defer statement.Close()

	var uid uuid.UUID
	var username, password string

	if err := statement.QueryRow(values...).Scan(&uid, &username, &password); err != nil {
		switch err {
		case sql.ErrNoRows:
			// User not found is not an error
			return nil, nil
		default:
			return nil, err
		}
	}

	user := &model.User{
		Uid:      uid,
		Username: username,
		Password: password,
	}

	return user, nil
}
