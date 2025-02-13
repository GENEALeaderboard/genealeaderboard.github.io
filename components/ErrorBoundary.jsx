"use client"

import { Callout } from "@/nextra"
import React, { Component } from "react"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-12 justify-center ">
          <Callout type="error">Unknow Error, please contact support</Callout>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
