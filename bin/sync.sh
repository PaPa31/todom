#!/bin/bash
# ================================================================
# GIFT SCRIPT - Robust Git Sync for MX/KDE
# For Rig #2: Xeon L5420 | ASIX USB Ethernet | MX-23 Bookworm
# ================================================================

declare -a PROJECT_FOLDERS=("/home/papa31/static/public/md" "/home/papa31/static/todom")
LOGFILE="/home/papa31/logfile.log"
NOTIFY=""
success=true
FAILED_DIR="${PROJECT_FOLDERS[0]}"

sync_project() {
  local index="$1"
  local project_folder="$2"
  local temp="/home/papa31/temp_$index"

  cd "$project_folder" || return 1
  echo "$index. $project_folder" >> "$LOGFILE"
  NOTIFY+="$index. $(basename "$project_folder")\n"

  local remote_name=$(git remote | head -n 1)

  # 1. PULL (The Gold Standard)
  echo "Pulling latest changes from truth..." >> "$LOGFILE"
  if ! git pull "$remote_name" master >> "$LOGFILE" 2>&1; then
    echo "  CONFLICT DETECTED! Manual resolution required." >> "$LOGFILE"
    NOTIFY+="  ⚠️ CONFLICT! Manual fix needed.\n"
    success=false
    FAILED_DIR="$project_folder"
    return 1
  fi

  # 2. COMMIT LOCAL CHANGES
  if [[ -n $(git status --short) ]]; then
    git add -A >> "$LOGFILE" 2>&1
    git commit -am "Autocommit at $(date +'%Y-%m-%d %H:%M:%S')" > "$temp" 2>&1
    cat "$temp" >> "$LOGFILE"

    file_count=$(grep -oE "[0-9]+ file[s]? changed" "$temp" || echo "changes")
    NOTIFY+="  $file_count\n"
    local changes_pushed=true
  else
    echo "  Clean (No local changes)" >> "$LOGFILE"
    changes_pushed=false
  fi

  # 3. PUSH
  echo "Pushing to remote..." >> "$LOGFILE"
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
  local ret

  if [[ "$success" == "false" ]]; then
    title="❌ Sync FAILED!"
    # No timeout for failure - waits for your command
    zenity --question --title="$title" --text="$message" \
           --ok-label="💻 Fix in Terminal" \
           --extra-button="📄 Open Log" \
           --cancel-label="Close"
    ret=$?

    echo "DEBUG: FAILURE MODE - Zenity return code: '$ret'" >> "$LOGFILE"

    case "$ret" in
      0) (konsole --workdir "$FAILED_DIR" &) & ;;
      5) (kwrite "$LOGFILE" &) & ;;
      *) echo "DEBUG: Failure box closed or ignored." >> "$LOGFILE" ;;
    esac
  else
    # SUCCESS MODE
    zenity --question --title="$title" --text="$message" \
           --ok-label="📄 Open Log" \
           --cancel-label="Close" \
           --timeout=10
    ret=$?

    echo "DEBUG: SUCCESS MODE - Zenity return code: '$ret'" >> "$LOGFILE"

    case "$ret" in
      0) (kwrite "$LOGFILE" &) & ;;
      5) echo "DEBUG: Timeout detected (Code 5). Exiting quietly..." >> "$LOGFILE" ;;
      *) echo "DEBUG: Success box closed or ignored." >> "$LOGFILE" ;;
    esac
  fi
  exit 0
}

# --- MAIN EXECUTION ---
> "$LOGFILE"  # Reset log at the very start
sleep 20      # Essential for Rig #2 ASIX USB wake-up

# Network Self-Healing
if ! ping -c 1 8.8.8.8 &>/dev/null; then
  echo "Network down! Attempting restart..." >> "$LOGFILE"
  # Uses the visudo NOPASSWD edit we made
  nmcli networking off && nmcli networking on || sudo service network-manager restart
  sleep 15 # Wait for DHCP handshake
fi

# Run Sync on folders
sync_project "1" "${PROJECT_FOLDERS[0]}"
sync_project "2" "${PROJECT_FOLDERS[1]}"

# Final Alert
send_notification
