import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-bold text-dark-brown mb-4">เกิดข้อผิดพลาด</h1>
          <p className="text-brown mb-8">บางอย่างผิดพลาด กรุณารีเฟรชหน้าใหม่</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-dark-brown text-beige rounded-full hover:bg-brown transition-colors"
          >
            รีเฟรชหน้า
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
