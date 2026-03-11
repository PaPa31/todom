#!/bin/bash

declare -a PROJECT_FOLDERS=("/home/papa31/static/public/md" "/home/papa31/static/todom")
GITHUB_REPO_PRIVATE="git@github.com:PaPa31/md"
GITHUB_REPO_PUBLIC="git@github.com:PaPa31/todom"

LOGFILE="/home/papa31/logfile.log"
NOTIFICATION_TITLE="Sync Successful"

NOTIFY=""

success=true

# Function to synchronize project folder with a GitHub repository
sync_project() {
  local project_folder="$2"
  temp="/home/papa31/temp"

  cd "$project_folder" || return 1

  echo "$1. " "$project_folder" >> "$LOGFILE"
  NOTIFY+="$1.$project_folder\n"

  # Identify the remote name (usually "origin")
  local remote_name=$(git remote | head -n 1)

  # 1. PULL FIRST (The Gold Standard)
  # This uses your new config: auto-stashing local changes and rebasing
  echo "Pulling latest changes from truth..." >> "$LOGFILE"
  git pull "$remote_name" master >> "$LOGFILE" 2>&1

  # Check if the pull was successful, and if not, log an error message
  if [[ $? -ne 0 ]]; then
    echo "  Failed to pull! Conflict might need manual resolution." >> "$LOGFILE"
    echo >> "$LOGFILE"
    NOTIFY+="  Pull Error (Conflict?)\n"
    success=false
    return 1
  fi

  # 2. COMMIT LOCAL CHANGES
  # Check if there are any changes in the working directory
  if [[ -n $(git status --short) ]]; then
    # Stage all changes, including file renames
    git add -A >> "$LOGFILE" 2>&1

    # Commit changes, with support for file renames
    git commit -am "Autocommit at $(date +'%Y-%m-%d %H:%M:%S')" > "$temp" 2>&1
    cat $temp >> $LOGFILE

    # Retrieve the number of changed files, if any
    if grep -q "changed" "$temp"; then
      file_count=$(grep -oE "[0-9]+ file[s]? changed" $temp)
      NOTIFY+="$file_count\n"
    fi

    # Check if the commit was successful
    if [[ $? -ne 0 ]]; then
      echo "  Failed to commit changes!" >> "$LOGFILE"
      NOTIFY+="  Failed to commit changes!\n"
      success=false
      return 1
    fi

    # Flag to track if changes were pushed
    local changes_pushed=true

  else
    echo "  No local changes to commit" >> "$LOGFILE"
    changes_pushed=false
  fi

  # 3. PUSH
  # Now that we are rebased and up-to-date, push will succeed
  # Push any unpushed commits, even if the working directory is clean
  echo "Pushing to remote..." >> "$LOGFILE"
  git push "$remote_name" master >> "$LOGFILE" 2>&1

  # Check if the push was successful, and if not, log an error message
  if [[ $? -ne 0 ]]; then
    echo "  Failed to push!" >> "$LOGFILE"
    NOTIFY+="  Failed to push!\n"
    success=false
    return 1
  fi

  # If the push was successful and no changes were committed, log it as already up-to-date
  if [[ $changes_pushed == false ]]; then
    NOTIFY+="  Everything up-to-date.\n"
  else
    echo "  Changes synced & pushed!" >> "$LOGFILE"
    NOTIFY+="  Changes synced & pushed!\n"
  fi

  echo >> "$LOGFILE"
  NOTIFY+="\n\n"

  rm $temp
}

# Function to display enhanced notification after synchronization
send_notification() {
  local sync_summary=""
  local repositories_with_changes=()

  if [[ $success == false ]]; then
    NOTIFICATION_TITLE="Sync Failed!!!"
    sync_summary="  See ~/logfile.log"
  fi

  local message="$sync_summary\n\n$NOTIFY"

  if command -v notify-send &>/dev/null; then
    notify-send "$NOTIFICATION_TITLE" "$message" -i emblem-default
  elif command -v zenity &>/dev/null; then
    zenity --info --title="$NOTIFICATION_TITLE" --text="$message"
  else
    echo "Notification: $NOTIFICATION_TITLE\n\n$message"
  fi
}

# Main script
{
  sleep 10

  > "$LOGFILE"

  echo >> "$LOGFILE"

  # Sync private repository
  sync_project "1" "${PROJECT_FOLDERS[0]}" "$GITHUB_REPO_PRIVATE" "Private Repository"

  # Sync public repository
  sync_project "2" "${PROJECT_FOLDERS[1]}" "$GITHUB_REPO_PUBLIC" "Public Repository"

  send_notification

} 2>&1

exit 0
