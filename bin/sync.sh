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

  if [[ "$success" == "false" ]]; then
    title="❌ Sync FAILED!"
    # Show Zenity box
    local action=$(zenity --question --title="$title" --text="$message" \
           --ok-label="💻 Fix in Terminal" \
           --extra-button="📄 Open Log" \
           --cancel-label="Close" \
           --timeout=10)
    local ret=$?
  else
    local action=$(zenity --question --title="$title" --text="$message" \
           --ok-label="📄 Open Log" \
           --cancel-label="Close" \
           --timeout=10)
    local ret=$?
  fi

  echo "DEBUG: Zenity return: '$ret' Action: '$action'" >> "$LOGFILE"

  # Handle the click (Case 0: OK button, Case "📄 Open Log": Extra button)
  case "$ret" in
    0)
      if [[ "$success" == "false" ]]; then
        # Launching Konsole in a subshell and detaching
        (konsole --workdir "$FAILED_DIR" &) &
      else
        # Launching KWrite in a subshell and detaching
        (kwrite "$LOGFILE" &) &
      fi
      ;;
    5)
      (kwrite "$LOGFILE" &) &
      ;;
  esac

  # This makes the script exit immediately instead of waiting for child processes
  exit 0
}

# Main
sleep 10
> "$LOGFILE"
sync_project "1" "${PROJECT_FOLDERS[0]}"
sync_project "2" "${PROJECT_FOLDERS[1]}"
send_notification
