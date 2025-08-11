function htmlRewriter(bindings) {
  const chunks = []
  const rewriter = new HTMLRewriter()

  for (const [selector, value] of Object.entries(bindings)) {
    const isHTML = /<\/?[a-z][\s\S]*>/i.test(value)
    rewriter.on(selector, {
      element(el) {
        el.setInnerContent(value, { html: isHTML })
      }
    })
  }
  return rewriter
}

export { htmlRewriter }