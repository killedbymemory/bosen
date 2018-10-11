package session

import (
	"database/sql"
	"fmt"
	"github.com/killedbymemory/bosen/backend/model"
	"github.com/satori/go.uuid"
	"strings"
)

type SessionRepository struct {
	DB *sql.DB
}

func NewSessionRepository(db *sql.DB) *SessionRepository {
	return &SessionRepository{DB: db}
}

func (repository *SessionRepository) GetDatabase() *sql.DB {
	return repository.DB
}

func (repository *SessionRepository) FindById(uid uuid.UUID) (*model.Session, error) {
	db := repository.GetDatabase()

	query := "SELECT uid FROM session WHERE uid = $1"
	statement, err := db.Prepare(query)

	if err != nil {
		return nil, err
	}

	var sessionId string

	dest := []interface{}{
		&sessionId,
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

	session := &model.Session{
		Uid: uid,
	}

	return session, nil
}

func (repository *SessionRepository) FindAll() ([]model.Session, error) {
	rows, err := repository.GetDatabase().Query("SELECT uid FROM session LIMIT 10")

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var sessions []model.Session

	for rows.Next() {
		var uid uuid.UUID

		if err = rows.Scan(&uid); err != nil {
			return nil, err
		}

		sessions = append(sessions, model.Session{Uid: uid})
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return sessions, nil
}

func (repository *SessionRepository) Add(session *model.Session) error {
	db := repository.GetDatabase()

	// In Postgresql, prepared statement parameter placeholder use $1, $2, ..., $n notation
	statement, err := db.Prepare("INSERT INTO session(uid) VALUES ($1)")

	if err != nil {
		return err
	}

	defer statement.Close()

	if _, err := statement.Exec(session.Uid); err != nil {
		return err
	}

	return nil
}

func (repository *SessionRepository) Edit(session *model.Session, changedFields map[string]interface{}) error {
	db := repository.GetDatabase()

	var updatedFields []string
	values := []interface{}{
		session.Uid,
	}

	index := 2 // Since $1 is reserved for session's uid
	for key, value := range changedFields {
		updatedFields = append(updatedFields, fmt.Sprintf("%s=$%d", key, index))
		values = append(values, value)
		index++
	}

	sql := fmt.Sprintf("UPDATE session SET %s WHERE uid = $1", strings.Join(updatedFields, ", "))
	statement, err := db.Prepare(sql)

	if err != nil {
		return err
	}

	defer statement.Close()

	if _, err := statement.Exec(values...); err != nil {
		return err
	}

	return nil
}

func (repository *SessionRepository) Delete(session *model.Session) (*model.Session, error) {
	db := repository.GetDatabase()

	sql := "DELETE FROM session WHERE uid = $1"
	statement, err := db.Prepare(sql)

	if err != nil {
		return session, err
	}

	defer statement.Close()

	if _, err := statement.Exec(session.Uid); err != nil {
		return session, err
	}

	return session, nil
}
