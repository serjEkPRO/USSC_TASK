import subprocess
import time

def stop_explorer():
    try:
        subprocess.run(["taskkill", "/f", "/im", "explorer.exe"], check=True)
        print("explorer.exe stopped")
    except subprocess.CalledProcessError as e:
        print(f"Error stopping explorer.exe: {e}")

def start_explorer():
    try:
        subprocess.run(["start", "explorer.exe"], shell=True, check=True)
        print("explorer.exe started")
    except subprocess.CalledProcessError as e:
        print(f"Error starting explorer.exe: {e}")

def restart_explorer():
    stop_explorer()
    time.sleep(2)  # Wait for 2 seconds before restarting
    start_explorer()

if __name__ == "__main__":
    restart_explorer()
