package services

// Idea represents an idea.
type Idea struct {
	ID           string    `json:"id" gorethink:"id,omitempty"`
	Name         string    `json:"name" gorethink:"name"`
	Summary      string    `json:"summary" gorethink:"summary"`
	Benefits     string    `json:"benefits" gorethink:"benefits"`
	Details      string    `json:"details" gorethink:"details"`
	State        string    `json:"state" gorethink:"state"`
	Tags         []string  `json:"tags" gorethink:"tags"`
	Skills       []string  `json:"skills" gorethink:"skills"`
	Technologies []string  `json:"technologies" gorethink:"technologies"`
	Proposers    []string  `json:"proposers" gorethink:"proposers"`
	Votes        []string  `json:"votes" gorethink:"votes"`
	Comments     []Comment `json:"comments" gorethink:"comments"`
	CreatedDate  string    `json:"createdDate" gorethink:"createdDate"`
	UpdatedDate  string    `json:"updatedDate" gorethink:"updatedDate"`
}

// Comment represents a comment.
type Comment struct {
	ID        string `json:"id" gorethink:"id"`
	Text      string `json:"text" gorethink:"text"`
	Timestamp string `json:"timestamp" gorethink:"timestamp"`
}

// String returns the string representation of an idea.
func (r *Idea) String() string {
	return r.Name
}

// Ideas represents an array of Idea instances.
type Ideas []*Idea

// ToInterfaces converts an Ideas instance to an array of empty interfaces.
func (r Ideas) ToInterfaces() []interface{} {
	if len(r) == 0 {
		return nil
	}
	ifs := make([]interface{}, len(r))
	for i, v := range r {
		ifs[i] = v
	}
	return ifs
}
