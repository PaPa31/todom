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
  local action ret
  local timeout_val="--timeout=10"

  if [[ "$success" == "false" ]]; then
    title="❌ Sync FAILED!"
    # Remove timeout for Failure State so it waits for YOU
    timeout_val=""

    action=$(zenity --question --title="$title" --text="$message" \
           --ok-label="💻 Fix in Terminal" \
           --extra-button="📄 Open Log" \
           --cancel-label="Close" \
           $timeout_val)
    ret=$?
  else
    # Keep 10s timeout for Success State
    action=$(zenity --question --title="$title" --text="$message" \
           --ok-label="📄 Open Log" \
           --cancel-label="Close" \
           $timeout_val)
    ret=$?
  fi

  echo "DEBUG: Zenity return: '$ret' Action: '$action'" >> "$LOGFILE"

  # The logic fix: Only launch if the specific button was pressed
  case "$ret" in
    0)
      if [[ "$success" == "false" ]]; then
        # On Failure, OK button = Fix in Terminal
        (konsole --workdir "$FAILED_DIR" &) &
      else
        # On Success, OK button = Open Log
        (kwrite "$LOGFILE" &) &
      fi
      ;;
    5)
      # Extra button (only exists in Failure mode) = Open Log
      (kwrite "$LOGFILE" &) &
      ;;
  esac

  exit 0
}

# Main
> "$LOGFILE"  # Reset log first so we see network debugs
sleep 20      # Give Rig #2 USB bus more time

if ! ping -c 1 8.8.8.8 &>/dev/null; then
  echo "Network down! Attempting restart..." >> "$LOGFILE"
  # Try nmcli first, if that fails, the visudo edit above will fix the sudo call
  nmcli networking off && nmcli networking on || sudo service network-manager restart
  sleep 10
fi

sync_project "1" "${PROJECT_FOLDERS[0]}"
sync_project "2" "${PROJECT_FOLDERS[1]}"
send_notification
