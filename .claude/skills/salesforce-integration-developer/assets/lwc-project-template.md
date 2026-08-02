# Lightning Web Component Project Template

A generic, reusable Lightning Web Component folder structure. Adapt
directory and component names to the specific application's domain — do
not copy any project-specific filenames from an example verbatim.

```text
force-app/
└── main/
    └── default/
        ├── lwc/
        │   ├── <feature>Form/              # Collects user input, calls Apex, dispatches result
        │   │   ├── <feature>Form.js
        │   │   ├── <feature>Form.html
        │   │   ├── <feature>Form.js-meta.xml
        │   │   ├── <feature>Form.css        # Only if SLDS utility classes are insufficient
        │   │   └── __tests__/
        │   │       └── <feature>Form.test.js
        │   ├── <feature>Result/             # Presents the returned data (success/empty/error)
        │   │   ├── <feature>Result.js
        │   │   ├── <feature>Result.html
        │   │   ├── <feature>Result.js-meta.xml
        │   │   └── __tests__/
        │   │       └── <feature>Result.test.js
        │   └── <feature>Panel/              # Optional: container composing form + result
        │       ├── <feature>Panel.js
        │       ├── <feature>Panel.html
        │       ├── <feature>Panel.js-meta.xml
        │       └── __tests__/
        │           └── <feature>Panel.test.js
        ├── classes/                          # See assets/apex-project-template.md
        └── namedCredentials/
            └── <Backend_Name>.namedCredential-meta.xml  # Committed as guidance/reference only —
                                                            # actual secrets configured per org, not
                                                            # stored in source control
```

---

## Notes

- Every component above must have a documented responsibility before it is
  created — do not scaffold a container component if a single component
  can present the full flow without becoming unwieldy.
- `__tests__/` sits alongside each component per the standard LWC Jest
  convention — do not create a separate top-level test directory.
- `namedCredentials/` metadata committed to source control must never
  contain the actual credential secret — only the shape (URL pattern,
  authentication protocol reference) needed to recreate the configuration
  in a new org. See [../references/named-credentials.md](../references/named-credentials.md).
- Do not add a Lightning App Page, Flexipage, or tab unless the
  implementation design specifies where the component is surfaced —
  generating placement metadata speculatively is out of scope for this
  skill.
