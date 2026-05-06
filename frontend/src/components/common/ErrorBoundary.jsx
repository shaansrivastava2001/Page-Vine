import React from "react";

class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.assign("/");
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="error-boundary">
        <div className="error-boundary__card">
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred while rendering this page.</p>
          <button type="button" onClick={this.handleReload}>
            Back to home
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
