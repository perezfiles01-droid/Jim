# Creating the repository and putting the report online

Everything you need is in this folder. The whole prototype is one file,
`index.html`, with no dependencies, no build step at view time, and no server
required. It opens by double click and it works on GitHub Pages unchanged.

Your GitHub account is **`perezfiles01-droid`**. All the links below assume it.

---

## 1. Create the repository

Go to **<https://github.com/new>**

Fill it in like this:

| Field | Value |
| --- | --- |
| Owner | `perezfiles01-droid` |
| Repository name | `Report` |
| Description | EDRMS Reports Utilization 2026.4 |
| Visibility | **Public** if you want the free GitHub Pages link. Private works too, but Pages on a private repo needs a paid plan |
| Add a README file | **Leave unticked.** There is already a README in this folder |
| .gitignore / licence | Leave as None |

Click **Create repository**.

The repository will be at **<https://github.com/perezfiles01-droid/Report>**

---

## 2. Upload the files

### The short way, straight in the browser

On the empty repository page click **uploading an existing file**, or go
directly to
**<https://github.com/perezfiles01-droid/Report/upload/main>**

Drag in these files and folders:

```
index.html          the report itself, this is the one that matters
README.md           what the project is and how to work on it
REQUIREMENTS.md     every line of the requirement, mapped to where it lands
DATA_SOURCES.md     what the tenant can actually supply, tier by tier
DEPLOY.md           this file
build.py            rebuilds index.html from src/
verify.js           the 231 check browser test
src/                the 16 source files index.html is built from
```

The browser uploader takes a folder if you drag the whole `src` folder in at
once. If it will not, upload the files at the top level first, then use
**Add file, Upload files** a second time and drop the contents of `src` in with
`src/` typed into the path box.

Write a commit message such as `Initial commit, 2026.4 Reports Utilization` and
click **Commit changes**.

### The git way, if you would rather use the command line

```bash
cd Report
git init
git add .
git commit -m "Initial commit, 2026.4 Reports Utilization"
git branch -M main
git remote add origin https://github.com/perezfiles01-droid/Report.git
git push -u origin main
```

---

## 3. Turn on GitHub Pages

Go to **<https://github.com/perezfiles01-droid/Report/settings/pages>**

- **Source**: Deploy from a branch
- **Branch**: `main`, folder `/ (root)`
- Click **Save**

Wait about a minute. The report will be live at:

### **<https://perezfiles01-droid.github.io/Report/>**

That is the link to send people. It serves `index.html` automatically because
that is the filename Pages looks for at the root.

Individual dashboards are directly linkable by adding the hash:

| Dashboard | Link |
| --- | --- |
| Bankwide oversight | `https://perezfiles01-droid.github.io/Report/#bo` |
| Risk and compliance | `.../#rc` |
| Department insight | `.../#di` |
| Records management | `.../#rm` |
| File plan insights | `.../#fp` |
| Archives holdings | `.../#ah` |
| Format and storage | `.../#fs` |
| Retention and disposition | `.../#rd` |
| Security and classification | `.../#sc` |
| Search and usage | `.../#su` |
| Data sources | `.../#ds` |

Useful when you want to drop somebody straight onto the page you are talking
about in an email or a meeting invitation.

---

## 4. Check it worked

Open the Pages link. You should see the navy sidebar, eleven entries, and
Bankwide oversight showing 3,472,880 total documents and 421,646 declared
records. Click through every left nav entry once. If any page is blank, open the
browser console: the prototype asserts its own totals at load and will say so
there.

---

## Notes worth knowing

**The minimum upload is one file.** If all you want is the link, upload
`index.html` on its own and turn on Pages. Everything else is there so the work
can be picked up and continued later.

**Editing.** Do not edit `index.html` by hand. Edit the file in `src/` and run
`python3 build.py`, which reassembles it. Hand edits are lost the next time
anybody rebuilds.

**Nothing sensitive is in here.** No credentials, no tenant extracts, no real
staff names. The figures are illustrative samples shaped to look like ADB at
this stage of rollout, and every panel says on its face where the real number
would come from. If this becomes a public repository, that is what is being made
public.

**If the report should not be public**, make the repository private and share
the file itself rather than a Pages link. `index.html` is self contained, so it
works from a SharePoint library, an email attachment, or a shared drive with no
loss of function.
