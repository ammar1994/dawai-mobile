#!/usr/bin/env python3
"""Post build errors as a GitHub issue for easy API access."""
import os, json, urllib.request

log_file = "/tmp/build.log"
lines = open(log_file).readlines() if os.path.exists(log_file) else ["No log file found\n"]

errors = [l for l in lines if any(k in l for k in [
    "error:", "Error:", "FAILURE:", "Caused by:", "what went wrong",
    "does not exist", "cannot find symbol", "Could not resolve",
    "Task :app:", "Exception", "FAILED"
]) and " at " not in l and "\tat" not in l]

run_num = os.environ.get("GITHUB_RUN_NUMBER", "?")
sha = os.environ.get("GITHUB_SHA", "")[:8]

body  = f"## Build Failure — Run #{run_num} ({sha})\n\n"
body += "### Key Errors\n```\n" + "".join(errors[-80:]) + "\n```\n\n"
body += "### Last 150 Lines\n```\n" + "".join(lines[-150:]) + "\n```"

payload = json.dumps({
    "title": f"Build error #{run_num}",
    "body": body[:65000],
    "labels": ["build-error"]
}).encode()

token = os.environ.get("GH_TOKEN", "")
repo  = os.environ.get("GITHUB_REPOSITORY", "ammar1994/dawai-mobile")

req = urllib.request.Request(
    f"https://api.github.com/repos/{repo}/issues",
    data=payload,
    headers={"Authorization": f"token {token}", "Content-Type": "application/json"},
    method="POST"
)
try:
    resp = urllib.request.urlopen(req)
    issue = json.loads(resp.read())
    print(f"✅ Issue #{issue.get('number')}: {issue.get('html_url')}")
except Exception as e:
    print(f"❌ Failed: {e}")
