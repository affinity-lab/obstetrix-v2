package services

import (
	"archive/tar"
	"compress/gzip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/yourorg/obstetrix/orchestrator/internal/config"
)

type BackupService struct{ cfg config.BackupConfig }

func newBackupService(cfg config.BackupConfig) *BackupService { return &BackupService{cfg: cfg} }

func (b *BackupService) DefaultSchedule() string  { return b.cfg.DefaultSchedule }
func (b *BackupService) DefaultRetention() int    { return b.cfg.DefaultRetention }
func (b *BackupService) DefaultDir() string       { return b.cfg.DefaultDir }

type BackupResult struct {
	Path      string `json:"path"`
	SizeBytes int64  `json:"sizeBytes"`
	CreatedAt string `json:"createdAt"`
	Label     string `json:"label"`
}

// Create writes a .tar.gz archive. Uses explicit closes (no defers) to capture errors.
func (b *BackupService) Create(label, destDir string, paths []string) (*BackupResult, error) {
	if err := os.MkdirAll(destDir, 0750); err != nil {
		return nil, fmt.Errorf("backup mkdir %s: %w", destDir, err)
	}
	ts := time.Now().UTC().Format("20060102-150405")
	archivePath := filepath.Join(destDir, fmt.Sprintf("%s-%s.tar.gz", label, ts))

	f, err := os.Create(archivePath)
	if err != nil {
		return nil, fmt.Errorf("backup create %s: %w", archivePath, err)
	}

	gw := gzip.NewWriter(f)
	tw := tar.NewWriter(gw)

	var walkErr error
	for _, srcPath := range paths {
		if err := addToTar(tw, srcPath); err != nil {
			walkErr = fmt.Errorf("backup add %s: %w", srcPath, err)
			break
		}
	}

	twErr := tw.Close()
	gwErr := gw.Close()
	fErr := f.Close()

	if walkErr != nil {
		os.Remove(archivePath)
		return nil, walkErr
	}
	if twErr != nil {
		os.Remove(archivePath)
		return nil, fmt.Errorf("backup tar close: %w", twErr)
	}
	if gwErr != nil {
		os.Remove(archivePath)
		return nil, fmt.Errorf("backup gzip close: %w", gwErr)
	}
	if fErr != nil {
		return nil, fmt.Errorf("backup file close: %w", fErr)
	}

	info, _ := os.Stat(archivePath)
	return &BackupResult{
		Path:      archivePath,
		SizeBytes: info.Size(),
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
		Label:     label,
	}, nil
}

func (b *BackupService) Prune(label, destDir string, keep int) error {
	entries, err := os.ReadDir(destDir)
	if err != nil {
		return nil
	}
	prefix := label + "-"
	var archives []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasPrefix(e.Name(), prefix) && strings.HasSuffix(e.Name(), ".tar.gz") {
			archives = append(archives, filepath.Join(destDir, e.Name()))
		}
	}
	sort.Strings(archives)
	for len(archives) > keep {
		os.Remove(archives[0])
		archives = archives[1:]
	}
	return nil
}

func (b *BackupService) List(label, destDir string) ([]BackupResult, error) {
	entries, err := os.ReadDir(destDir)
	if err != nil {
		return nil, nil
	}
	prefix := label + "-"
	var results []BackupResult
	for _, e := range entries {
		if e.IsDir() || !strings.HasPrefix(e.Name(), prefix) {
			continue
		}
		info, _ := e.Info()
		results = append(results, BackupResult{
			Path:      filepath.Join(destDir, e.Name()),
			SizeBytes: info.Size(),
			CreatedAt: info.ModTime().UTC().Format(time.RFC3339),
			Label:     label,
		})
	}
	for i, j := 0, len(results)-1; i < j; i, j = i+1, j-1 {
		results[i], results[j] = results[j], results[i]
	}
	return results, nil
}

func addToTar(tw *tar.Writer, root string) error {
	return filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		hdr, err := tar.FileInfoHeader(info, "")
		if err != nil {
			return err
		}
		hdr.Name = path
		if err := tw.WriteHeader(hdr); err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}
		f, err := os.Open(path)
		if err != nil {
			return err
		}
		defer f.Close()
		_, err = io.Copy(tw, f)
		return err
	})
}
