#!/bin/bash

# Bei Fehlern abbrechen
set -e

# Farben für Terminal-Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

error_exit() {
  echo -e "${RED}Fehler: $1${NC}" >&2
  exit 1
}

# Prüfen, ob Git installiert und ein Repo vorhanden ist
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || error_exit "Dies ist kein Git-Repository."

# Prüfen auf ungesicherte Änderungen (dirty state)
if ! git diff-index --quiet HEAD --; then
  echo -e "${YELLOW}Warnung: Du hast uncommitted Änderungen in deinem Repository.${NC}"
  read -p "Möchtest du trotzdem fortfahren? (y/N): " confirm
  if [[ ! "$confirm" =~ ^[yY]$ ]]; then
    error_exit "Abgebrochen durch Benutzer."
  fi
fi

# Aktuellen Branch prüfen (Empfehlung: main/master)
CURRENT_BRANCH=$(git branch --show-current)
echo -e "Aktueller Branch: ${GREEN}${CURRENT_BRANCH}${NC}"

# Aktuelle Version aus frontend/package.json ermitteln
CURRENT_VERSION=$(node -e "try { console.log(require('./frontend/package.json').version); } catch { console.log('0.0.0'); }")

# In Major, Minor, Patch zerlegen
IFS='.' read -r major minor patch <<< "${CURRENT_VERSION#v}"

NEXT_PATCH="${major}.${minor}.$((patch + 1))"
NEXT_MINOR="${major}.$((minor + 1)).0"
NEXT_MAJOR="$((major + 1)).0.0"

# Versionsnummer ermitteln
VERSION=$1
if [ -z "$VERSION" ]; then
  echo -e "Aktuelle Version: ${GREEN}${CURRENT_VERSION}${NC}\n"
  echo "Welchen Release-Typ möchtest du durchführen?"
  echo -e "1) Patch  -> ${YELLOW}${NEXT_PATCH}${NC}"
  echo -e "2) Minor  -> ${YELLOW}${NEXT_MINOR}${NC}"
  echo -e "3) Major  -> ${YELLOW}${NEXT_MAJOR}${NC}"
  echo -e "4) Custom -> Manuelle Eingabe"
  echo
  read -p "Auswahl [1-4]: " choice
  
  case $choice in
    1) VERSION="$NEXT_PATCH" ;;
    2) VERSION="$NEXT_MINOR" ;;
    3) VERSION="$NEXT_MAJOR" ;;
    4)
      read -p "Bitte gib die manuelle Version ein (z. B. 1.0.0): " VERSION
      ;;
    *)
      error_exit "Ungültige Auswahl."
      ;;
  esac
fi

# Leere Eingabe abfangen
if [ -z "$VERSION" ]; then
  error_exit "Die Version darf nicht leer sein."
fi

# Sicherstellen, dass die Version mit 'v' beginnt (für die GitHub Action / Git Tag)
if [[ ! "$VERSION" =~ ^v ]]; then
  VERSION="v$VERSION"
fi

# Prüfen, ob das Tag lokal oder remote bereits existiert
if git rev-parse "$VERSION" >/dev/null 2>&1; then
  error_exit "Das Tag $VERSION existiert bereits lokal."
fi

if git ls-remote --tags origin | grep -q "refs/tags/${VERSION}$"; then
  error_exit "Das Tag $VERSION existiert bereits auf remote (origin)."
fi

# Versionen in den package.json-Dateien anpassen
echo -e "${GREEN}Aktualisiere Version in frontend & backend...${NC}"
npm --prefix frontend version "$VERSION" --no-git-tag-version --allow-same-version
npm --prefix backend version "$VERSION" --no-git-tag-version --allow-same-version

# Änderungen commiten
echo -e "${GREEN}Erstelle Commit für den Versions-Bump...${NC}"
git add frontend/package.json frontend/package-lock.json backend/package.json backend/package-lock.json
git commit -m "chore: bump version to $VERSION"

# Commit pushen
echo -e "${GREEN}Pushe Commit zu origin/${CURRENT_BRANCH}...${NC}"
git push origin "$CURRENT_BRANCH"

# Tag erstellen und pushen
echo -e "\n${GREEN}Erstelle Tag: $VERSION...${NC}"
git tag -a "$VERSION" -m "Release $VERSION"

echo -e "${GREEN}Pushe Tag $VERSION zu origin...${NC}"
git push origin "$VERSION"

echo -e "\n${GREEN}Erfolgreich! Der Versions-Bump wurde gepusht und das Tag $VERSION erstellt.${NC}"
echo -e "Die GitHub Action sollte in Kürze starten, um die Docker-Images zu bauen."
