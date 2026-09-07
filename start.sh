#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

SESSION="jobhunter"
RESTART=0

usage() {
  cat <<'USAGE'
Usage: ./start.sh [--restart|-r]

Starts backend, web, and extension dev servers in a tmux session named "jobhunter".

  ./start.sh           Create session (or attach if it already exists)
  ./start.sh --restart Kill existing session and recreate
  tmux attach -t jobhunter   Re-attach later
  Ctrl-b d                   Detach (leave servers running)
USAGE
}

for arg in "$@"; do
  case "$arg" in
    -r|--restart) RESTART=1 ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if ! command -v tmux >/dev/null 2>&1; then
  echo "error: tmux is not installed. Install it (e.g. sudo apt install tmux) and retry." >&2
  exit 1
fi

if [[ ! -f backend/.env ]]; then
  echo "warning: backend/.env is missing — the API will fail until you create it (see backend/.env.example)." >&2
fi

if tmux has-session -t "$SESSION" 2>/dev/null; then
  if [[ "$RESTART" -eq 1 ]]; then
    echo "Killing existing session '$SESSION'..."
    tmux kill-session -t "$SESSION"
  else
    echo "Session '$SESSION' already exists — attaching."
    echo "Tip: ./start.sh --restart to kill and recreate."
    exec tmux attach -t "$SESSION"
  fi
fi

# Layout:
#   ┌──────────────┬──────────────┐
#   │   backend    │     web      │
#   │   (:4000)    ├──────────────┤
#   │              │  extension   │
#   └──────────────┴──────────────┘
tmux new-session -d -s "$SESSION" -n "dev" -c "$ROOT"
tmux send-keys -t "$SESSION:dev.0" "npm run dev:backend" C-m
tmux select-pane -t "$SESSION:dev.0" -T "backend :4000"

tmux split-window -h -t "$SESSION:dev.0" -c "$ROOT"
tmux send-keys -t "$SESSION:dev.1" "npm run dev:web" C-m
tmux select-pane -t "$SESSION:dev.1" -T "web :3000"

tmux split-window -v -t "$SESSION:dev.1" -c "$ROOT"
tmux send-keys -t "$SESSION:dev.2" "npm run dev:extension" C-m
tmux select-pane -t "$SESSION:dev.2" -T "extension"

tmux select-layout -t "$SESSION:dev" main-vertical
tmux set-option -t "$SESSION" pane-border-status top
tmux set-option -t "$SESSION" pane-border-format " #{pane_title} "
tmux select-pane -t "$SESSION:dev.0"

echo
echo "Started tmux session '$SESSION'."
echo "  Attach:  tmux attach -t $SESSION"
echo "  Detach:  Ctrl-b d  (servers keep running)"
echo "  Restart: ./start.sh --restart"
echo

exec tmux attach -t "$SESSION"
