# Drive submission deployment

The course submit.html embeds the Apps Script HTML form. The app executes as the authorized owner and accepts students signed into Google. The Workspace deployment UI does not offer anonymous access.

Project: https://script.google.com/home/projects/1DXl_iCzSk8FYFHU7_peycbM0GA8haKM7Pbv39nzBD2ZnrCMNWTNrOdlA/edit

`Code.gs` includes the HTML form and server-side validation. `doGet()` creates a private collection folder only when the FOLDER_ID script property is absent. Folders and files are never shared publicly. Files are named studentID_name_DNA.fasta; subsequent distinct submissions preserve earlier files with the same name. Repeating the same request ID returns the existing receipt.

To update: save Code.gs in this project, create a new version through Manage deployments, then keep the existing deployment URL. Never embed Google credentials in the static website.
