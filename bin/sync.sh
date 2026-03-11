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
  local title icon args action

  if [[ $success == false ]]; then
    title="❌ Sync FAILED!"
    icon="error"
    args=(--action="fix:💻 Fix in Terminal")
  else
    title="✅ Sync Successful"
    icon="emblem-success"
  fi
  args+=(--action="log:📄 Open Log")

  # Capture the action by telling notify-send to WAIT for the user or timeout
  echo "DEBUG: Waiting for notification click (with --wait flag)..." >> "$LOGFILE"
#   action=$(notify-send "$title" "$NOTIFY" --icon="$icon" "${args[@]}" --wait)
  action=$(notify-send "$title" "$NOTIFY" --icon="$icon" "${args[@]}" -p)

  echo "DEBUG: Notification action captured: '$action'" >> "$LOGFILE"


  case "$action" in
    "fix")
      echo "DEBUG: Attempting to launch Konsole in $FAILED_DIR" >> "$LOGFILE"
      # kstart5 is the KDE way to launch detached GUI apps
      kstart5 konsole --workdir "$FAILED_DIR" >/dev/null 2>&1 &
      ;;
    "log")
      echo "DEBUG: Attempting to launch KWrite for $LOGFILE" >> "$LOGFILE"
      # setsid runs the program in a new session entirely
      setsid kwrite "$LOGFILE" >/dev/null 2>&1 &
      ;;
    *)
      echo "DEBUG: No action or notification timed out." >> "$LOGFILE"
      ;;
  esac

  # Ensure the background process detaches
  disown -a
}

# Main
sleep 10
> "$LOGFILE"
sync_project "1" "${PROJECT_FOLDERS[0]}"
sync_project "2" "${PROJECT_FOLDERS[1]}"
send_notification
