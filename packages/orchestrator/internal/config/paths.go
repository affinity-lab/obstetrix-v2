package config

import "path/filepath"

type Paths struct {
	Root          string // /etc/obstetrix
	ObstetrixConf string // /etc/obstetrix/obstetrix.conf
	ProjectsDir   string // /etc/obstetrix/projects
}

func NewPaths(root string) Paths {
	return Paths{
		Root:          root,
		ObstetrixConf: filepath.Join(root, "obstetrix.conf"),
		ProjectsDir:   filepath.Join(root, "projects"),
	}
}

func (p Paths) Project(name string) ProjectPaths {
	base := filepath.Join(p.ProjectsDir, name)
	return ProjectPaths{
		Dir:   base,
		Conf:  filepath.Join(base, "project.conf"),
		Env:   filepath.Join(base, ".env"),
		Npmrc: filepath.Join(base, ".npmrc"),
	}
}

type ProjectPaths struct {
	Dir   string
	Conf  string
	Env   string
	Npmrc string
}
