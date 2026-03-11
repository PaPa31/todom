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
  local title="Sync Status"
  local message="Summary:\n$NOTIFY"
  local cmd_args=()

  if [[ $success == false ]]; then
    title="❌ Sync FAILED!"
    # kdialog --yesnocancel: Yes=Fix, No=Log, Cancel=Exit
    kdialog --title "$title" --yesnocancel "$message" \
            --yes-label "💻 Fix in Terminal" \
            --no-label "📄 Open Log" \
            --cancel-label "Close" \
            --icon error \
            --timeout 10
    local action=$?
  else
    title="✅ Sync Successful"
    # kdialog --yesno: Yes=Log, No=Close
    kdialog --title "$title" --yesno "$message" \
            --yes-label "📄 Open Log" \
            --no-label "Close" \
            --icon emblem-success \
            --timeout 10
    local action=$?
  fi

  # KDialog Exit Codes:
  # 0 = Yes (Fix or Log depending on context)
  # 1 = No (Log or Close)
  # 2 = Cancel
  # 255 = Timeout

  echo "DEBUG: KDialog action code: '$action'" >> "$LOGFILE"

  if [[ $success == false ]]; then
    [[ $action -eq 0 ]] && kstart5 konsole --workdir "$FAILED_DIR" &
    [[ $action -eq 1 ]] && kstart5 kwrite "$LOGFILE" &
  else
    [[ $action -eq 0 ]] && kstart5 kwrite "$LOGFILE" &
  fi
}

# Main
sleep 10
> "$LOGFILE"
sync_project "1" "${PROJECT_FOLDERS[0]}"
sync_project "2" "${PROJECT_FOLDERS[1]}"
send_notification
