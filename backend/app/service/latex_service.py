import io
import re
import tarfile
import time
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional, Tuple, Union

PREAMBLE = r"""\documentclass[10pt,letterpaper]{article}
\usepackage[top=0.6in,bottom=0.6in,left=0.65in,right=0.65in]{geometry}
\usepackage{enumitem}
\usepackage{hyperref}
\usepackage{titlesec}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\hypersetup{colorlinks=true,urlcolor=black,linkcolor=black}
\pagestyle{empty}
\setlength{\parindent}{0pt}
\setlength{\parskip}{0pt}
\linespread{1.08}

\titleformat{\section}{\vspace{5pt plus 2pt}\scshape\raggedright\normalsize}{}{0em}{}[\titlerule\vspace{3.5pt plus 1.5pt}]
\newcommand{\resumeItem}[1]{\item\small{#1}}
\newcommand{\entry}[4]{
  \vspace{3.5pt plus 2pt}
  \textbf{#1} \hfill \small\textit{#2}\\[1.5pt]
  \small\textit{#3}
  \begin{itemize}[leftmargin=*,label=\textbullet,itemsep=2pt plus 1.5pt,parsep=0pt,topsep=2pt plus 1.5pt]
    #4
  \end{itemize}
}
\begin{document}
"""



def esc(s: Any) -> str:
    if s is None:
        return ""
    text = str(s)
    table = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    return "".join(table.get(c, c) for c in text)


def href(text: str, url: Optional[str] = None) -> str:

    if url and str(url).strip():
        clean_url = str(url).strip()
        if not (clean_url.startswith("http://") or clean_url.startswith("https://") or clean_url.startswith("mailto:")):
            clean_url = "https://" + clean_url

        if any(c in clean_url for c in ["{", "}", "\\", "%", "$", "#", "^", "_", "~"]):
            clean_url = re.sub(r"[{}\\\%\$\#\^\_\~]", "", clean_url)

        return rf"\href{{{clean_url}}}{{{esc(text)}}}"
    return esc(text)


def items(bullets: List[str]) -> str:
    return "\n".join(rf"    \resumeItem{{{esc(b)}}}" for b in bullets if b and str(b).strip())


def parse_contact(contact_raw: Any) -> List[Tuple[str, Optional[str]]]:
    parsed = []
    if not contact_raw:
        return parsed

    for item in contact_raw:
        if isinstance(item, (list, tuple)) and len(item) >= 2:
            parsed.append((str(item[0]), str(item[1]) if item[1] else None))

        elif isinstance(item, dict):
            text = item.get("text") or item.get("label") or item.get("value") or ""
            url = item.get("url")

            parsed.append((str(text), str(url) if url else None))
        elif hasattr(item, "text"):
            parsed.append((str(item.text), str(item.url) if item.url else None))

        elif isinstance(item, str):
            parsed.append((item, None))

    return parsed


def parse_skills(skills_raw: Any) -> List[Tuple[str, str]]:

    parsed = []
    if not skills_raw:
        return parsed

    for item in skills_raw:
        if isinstance(item, (list, tuple)) and len(item) >= 2:
            parsed.append((str(item[0]), str(item[1])))

        elif isinstance(item, dict):
            cat = item.get("category") or item.get("name") or "Skills"
            val = item.get("skills") or item.get("value") or ""
            parsed.append((str(cat), str(val)))

        elif hasattr(item, "category") and hasattr(item, "skills"):
            parsed.append((str(item.category), str(item.skills)))

    return parsed


def parse_education(edu_raw: Any) -> List[Tuple[str, str, str]]:

    parsed = []
    if not edu_raw:
        return parsed

    for item in edu_raw:
        if isinstance(item, (list, tuple)) and len(item) >= 3:
            parsed.append((str(item[0]), str(item[1]), str(item[2])))

        elif isinstance(item, dict):
            degree = item.get("degree") or item.get("title") or ""
            status = item.get("status") or item.get("date") or ""
            school = item.get("school") or item.get("institution") or ""
            parsed.append((str(degree), str(status), str(school)))

        elif hasattr(item, "degree"):
            parsed.append((str(item.degree), str(item.status), str(item.school)))

    return parsed


def build_tex(r: Any) -> str:

    if hasattr(r, "model_dump"):
        data = r.model_dump()

    elif hasattr(r, "dict"):
        data = r.dict()

    elif isinstance(r, dict):
        data = r
    else:
        raise ValueError("Invalid resume data structure provided to build_tex")

    sep = r" \enspace|\enspace "
    out = [PREAMBLE]

    contact_list = parse_contact(data.get("contact", []))
    contact_str = sep.join(href(t, u) for t, u in contact_list if t)
    name = data.get("name", "Candidate Name")

    out.append(
        "\\begin{center}\n"
        f"  {{\\Large\\bfseries {esc(name)}}}\\\\[3pt]\n"
        f"  \\small {contact_str}\n"
        "\\end{center}\n"
    )

    summary = str(data.get("summary", "")).strip()
    if summary:
        out.append(f"\\section{{Professional Summary}}\n{esc(summary)}\n")

    experiences = data.get("experience", [])
    if experiences:
        out.append("\\section{Experience}")
        for e in experiences:
            if hasattr(e, "model_dump"):
                e = e.model_dump()
            elif hasattr(e, "dict"):
                e = e.dict()
            title = e.get("title", "")
            date = e.get("date", "")
            sub = e.get("sub", "")
            bullets = e.get("bullets", [])
            out.append(
                f"\\entry{{{esc(title)}}}{{{esc(date)}}}{{{esc(sub)}}}"
                f"{{\n{items(bullets)}\n  }}"
            )

    skills_list = parse_skills(data.get("skills", []))
    if skills_list:
        out.append(
            "\n\\section{Technical Skills}\n"
            "\\begin{itemize}[leftmargin=*,label={},itemsep=2pt plus 3pt,parsep=0pt,topsep=2pt plus 2pt]"
        )
        for k, v in skills_list:
            out.append(f"  \\item \\textbf{{{esc(k)}:}} {esc(v)}")
        out.append("\\end{itemize}\n")

    projects = data.get("projects", [])
    if projects:
        out.append("\\section{Project Experience}")
        for p in projects:
            if hasattr(p, "model_dump"):
                p = p.model_dump()
            elif hasattr(p, "dict"):
                p = p.dict()
            name = p.get("name", "")
            raw_link = p.get("link", "")
            link_tex = href(raw_link, raw_link) if raw_link else ""
            stack = p.get("stack", "")
            bullets = p.get("bullets", [])
            out.append(
                f"\\entry{{{esc(name)}}}{{{link_tex}}}{{{esc(stack)}}}"
                f"{{\n{items(bullets)}\n  }}"
            )

    edu_list = parse_education(data.get("education", []))
    if edu_list:
        out.append(
            "\n\\section{Education}\n"
            "\\begin{itemize}[leftmargin=*,label={},itemsep=2pt plus 3pt,parsep=0pt,topsep=2pt plus 2pt]"
        )
        for degree, status, school in edu_list:
            out.append(
                f"  \\item \\textbf{{{esc(degree)}}} \\hfill \\textit{{{esc(status)}}}\\\\\n"
                f"  \\small {esc(school)}"
            )
        out.append("\\end{itemize}\n")


    out.append("\n\\end{document}\n")
    return "\n".join(out)



def compile_latex_to_pdf(tex_code: str) -> bytes:
 
    try:
        buf = io.BytesIO()
        data = tex_code.encode("utf-8")
        with tarfile.open(fileobj=buf, mode="w:gz") as tar:
            ti = tarfile.TarInfo(name="main.tex")
            ti.size = len(data)
            ti.mtime = int(time.time())
            tar.addfile(ti, io.BytesIO(data))
        tar_bytes = buf.getvalue()

        api_url = "https://latexonline.cc/data?target=main.tex"
        req = urllib.request.Request(
            api_url,
            data=tar_bytes,
            headers={
                "Content-Type": "application/tar+gzip",
                "User-Agent": "Devora-AI/1.0",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            if response.status == 200:
                pdf_bytes = response.read()
                if pdf_bytes.startswith(b"%PDF"):
                    return pdf_bytes
    except Exception as e_tar:
        try:
            get_url = "https://latexonline.cc/compile?text=" + urllib.parse.quote(tex_code)
            req_get = urllib.request.Request(get_url, headers={"User-Agent": "Devora-AI/1.0"})
            with urllib.request.urlopen(req_get, timeout=30) as response:
                if response.status == 200:
                    pdf_bytes = response.read()
                    if pdf_bytes.startswith(b"%PDF"):
                        return pdf_bytes
        except Exception as e_get:
            raise RuntimeError(f"LaTeX compile error: {str(e_tar)} | Fallback error: {str(e_get)}")

    raise RuntimeError("Online LaTeX service se valid PDF nahi mila.")
