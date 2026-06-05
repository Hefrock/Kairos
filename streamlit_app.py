import pathlib
import streamlit as st

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Kairos",
    page_icon="⏳",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Check that the static build exists ───────────────────────────────────────
build = pathlib.Path(__file__).parent / "static" / "index.html"
if not build.exists():
    st.error(
        "**Kairos build not found.** "
        "Run `npm run build:streamlit` to generate `static/index.html`, "
        "then commit it to the repository."
    )
    st.stop()

# ── Render ────────────────────────────────────────────────────────────────────
# Static files are served by Streamlit at /app/static/.
# We embed them via a plain <iframe src="..."> rather than st.components.v1.html()
# (which uses srcdoc and therefore runs under a null/opaque origin, blocking
# IndexedDB). An src-based iframe gets the app's real origin so IndexedDB works.
st.markdown("""
<style>
  /* Remove all Streamlit chrome */
  #MainMenu                           { display: none !important; }
  header[data-testid="stHeader"]      { display: none !important; }
  footer                              { display: none !important; }
  [data-testid="stToolbar"]           { display: none !important; }
  [data-testid="stDecoration"]        { display: none !important; }
  [data-testid="stStatusWidget"]      { display: none !important; }

  /* Collapse all Streamlit padding */
  .block-container                    { padding: 0 !important; max-width: 100% !important; }
  [data-testid="stAppViewContainer"]  { padding: 0 !important; }
  [data-testid="stVerticalBlock"]     { gap: 0 !important; padding: 0 !important; }
  .stMarkdown                         { line-height: 0 !important; }
</style>

<iframe
  src="app/static/index.html"
  style="width:100%;height:100vh;border:none;display:block;margin:0;padding:0;"
  title="Kairos"
></iframe>
""", unsafe_allow_html=True)
