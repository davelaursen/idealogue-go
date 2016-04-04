package services

// User represents a user.
type User struct {
	ID          string `json:"id" gorethink:"id,omitempty"`
	FirstName   string `json:"firstName" gorethink:"firstName"`
	LastName    string `json:"lastName" gorethink:"lastName"`
	Email       string `json:"email" gorethink:"email"`
	CreatedDate string `json:"createdDate" gorethink:"createdDate"`
	UpdatedDate string `json:"updatedDate" gorethink:"updatedDate"`
}

// String returns the string representation of a user.
func (r *User) String() string {
	return r.FirstName + " " + r.LastName
}

// Users represents an array of User instances.
type Users []*User

// ToInterfaces converts an Ideas instance to an array of empty interfaces.
func (u Users) ToInterfaces() []interface{} {
	if len(u) == 0 {
		return nil
	}
	ifs := make([]interface{}, len(u))
	for i, v := range u {
		ifs[i] = v
	}
	return ifs
}
