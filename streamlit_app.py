import pathlib
import streamlit as st
import streamlit.components.v1 as components

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Kairos",
    page_icon="⏳",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Strip all Streamlit chrome so only the React app is visible ───────────────
st.markdown("""
<style>
  /* Hide Streamlit header, menu, footer */
  #MainMenu                          { display: none !important; }
  header[data-testid="stHeader"]     { display: none !important; }
  footer                             { display: none !important; }
  [data-testid="stToolbar"]          { display: none !important; }
  [data-testid="stDecoration"]       { display: none !important; }
  [data-testid="stStatusWidget"]     { display: none !important; }

  /* Collapse all padding so the iframe touches the edges */
  .block-container                   { padding: 0 !important; max-width: 100% !important; }
  [data-testid="stAppViewContainer"] { padding: 0 !important; }
  [data-testid="stVerticalBlock"]    { gap: 0 !important; padding: 0 !important; }

  /* Make the component iframe fill the full viewport height */
  iframe { height: 100vh !important; min-height: 100vh !important; border: none; }
</style>
""", unsafe_allow_html=True)

# ── Load the pre-built single-file React app ──────────────────────────────────
build = pathlib.Path(__file__).parent / "streamlit_build" / "index.html"

if not build.exists():
    st.error(
        "**Kairos build not found.** "
        "Run `npm run build:streamlit` to generate `streamlit_build/index.html`, "
        "then commit it to the repository."
    )
    st.stop()

html = build.read_text(encoding="utf-8")

# height=950 is a safe default; the CSS above overrides it to 100vh in
# supported browsers, so the app fills the full window on modern desktops.
components.html(html, height=950, scrolling=False)
