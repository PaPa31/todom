#!/bin/bash

declare -a PROJECT_FOLDERS=("/home/papa31/static/public/md" "/home/papa31/static/todom")
LOGFILE="/home/papa31/logfile.log"
NOTIFY=""
success=true
FAILED_DIR="${PROJECT_FOLDERS[0]}" # Default fix dir

sync_project() {
  local index="$1"
  local project_folder="$2"
  local temp="/home/papa31/temp_$index" # Unique temp file per project

  cd "$project_folder" || return 1
  echo "$index. $project_folder" >> "$LOGFILE"
  NOTIFY+="$index. $(basename "$project_folder")\n"

  local remote_name=$(git remote | head -n 1)

  # 1. PULL
  echo "Pulling..." >> "$LOGFILE"
  if ! git pull "$remote_name" master >> "$LOGFILE" 2>&1; then
    echo "  CONFLICT!" >> "$LOGFILE"
    NOTIFY+="  ⚠️ CONFLICT!\n"
    success=false
    FAILED_DIR="$project_folder"
    return 1
  fi

  # 2. COMMIT
  if [[ -n $(git status --short) ]]; then
    git add -A >> "$LOGFILE" 2>&1
    git commit -am "Autocommit at $(date +'%Y-%m-%d %H:%M:%S')" > "$temp" 2>&1
    cat "$temp" >> "$LOGFILE"

    file_count=$(grep -oE "[0-9]+ file[s]? changed" "$temp" || echo "changes")
    NOTIFY+="  $file_count\n"
    local changes_pushed=true
  else
    echo "  Clean" >> "$LOGFILE"
    changes_pushed=false
  fi

  # 3. PUSH
  echo "Pushing..." >> "$LOGFILE"
  if ! git push "$remote_name" master >> "$LOGFILE" 2>&1; then
    echo "  Push failed!" >> "$LOGFILE"
    NOTIFY+="  ❌ Push Failed!\n"
    success=false
    FAILED_DIR="$project_folder"
    return 1
  fi

  [[ $changes_pushed == true ]] && NOTIFY+="  Done ✅\n" || NOTIFY+="  Up-to-date\n"
  echo >> "$LOGFILE"
  NOTIFY+="\n"
  [[ -f "$temp" ]] && rm "$temp"
}

send_notification() {
  local title="✅ Sync Successful"
  local message="Summary:\n$NOTIFY"
  local status_icon="info"

  if [[ $success == false ]]; then
    title="❌ Sync FAILED!"
    status_icon="error"
    # Zenity Question box: OK = Fix, Extra = Log
    zenity --question --title="$title" --text="$message" \
           --ok-label="💻 Fix in Terminal" \
           --extra-button="📄 Open Log" \
           --cancel-label="Close" \
           --icon-name="$status_icon" \
           --timeout=10
    local action=$?
  else
    # Success box: OK = Open Log, Cancel = Close
    zenity --question --title="$title" --text="$message" \
           --ok-label="📄 Open Log" \
           --cancel-label="Close" \
           --icon-name="$status_icon" \
           --timeout=10
    local action=$?
  fi

  echo "DEBUG: Zenity action code: '$action'" >> "$LOGFILE"

  # Zenity Exit Codes:
  # 0 = OK (Fix or Log)
  # 1 = Cancel/Close
  # 5 = Extra Button (Open Log in Failed mode)
  # 100 or -1 = Timeout

  case "$action" in
    0)
      if [[ $success == false ]]; then
        kstart5 konsole --workdir "$FAILED_DIR" &
      else
        kstart5 kwrite "$LOGFILE" &
      fi
      ;;
    "📄 Open Log") # Zenity returns the label string for extra buttons
      kstart5 kwrite "$LOGFILE" &
      ;;
    5) # Some versions return 5 for the extra button
      kstart5 kwrite "$LOGFILE" &
      ;;
  esac
}


# Main
sleep 10
> "$LOGFILE"
sync_project "1" "${PROJECT_FOLDERS[0]}"
sync_project "2" "${PROJECT_FOLDERS[1]}"
send_notification
