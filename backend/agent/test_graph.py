import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from agent.graph import app

def run_test():
    # Path to a test audio file
    # Inside container, backend is mapped to /app. 
    # Script is in /app/agent/test_graph.py
    # Audio is in /app/audio_prontuario.ogg
    audio_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "../audio_prontuario.ogg"))
    
    if not os.path.exists(audio_file):
        print(f"File not found: {audio_file}")
        return

    print(f"Running graph with audio: {audio_file}")
    
    inputs = {"audio_path": audio_file}
    
    for output in app.stream(inputs):
        for key, value in output.items():
            print(f"Finished Node: {key}")
            if key == "transcriber":
                print(f"  Text: {value.get('transcribed_text')}")
            
            if key == "agent":
                messages = value.get("messages", [])
                if messages:
                    last_msg = messages[-1]
                    print(f"  Last Message: {last_msg.content}")
                    if hasattr(last_msg, 'tool_calls') and last_msg.tool_calls:
                        print(f"  Tool Calls: {last_msg.tool_calls}")
                
            if "error" in value and value["error"]:
                print(f"  Error: {value['error']}")

if __name__ == "__main__":
    run_test()
