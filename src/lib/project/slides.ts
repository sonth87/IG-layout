import { slideOf } from "./geometry";
import { MAX_SLIDES, type ProjectDoc, SLIDE_SIZE } from "./types";

// Slide operations. An element belongs to the slide containing its center;
// elements after the change point move by one slide width
// (docs/architecture/editor-model.md, mục 5).

export function insertSlide(doc: ProjectDoc, after: number): ProjectDoc {
  if (doc.slideCount >= MAX_SLIDES) return doc;
  const { width } = SLIDE_SIZE[doc.ratio];
  return {
    ...doc,
    slideCount: doc.slideCount + 1,
    elements: doc.elements.map((el) =>
      slideOf(el, width, doc.slideCount) > after ? { ...el, x: el.x + width } : el,
    ),
  };
}

export function deleteSlide(doc: ProjectDoc, index: number): ProjectDoc {
  if (doc.slideCount <= 1) return doc;
  const { width } = SLIDE_SIZE[doc.ratio];
  return {
    ...doc,
    slideCount: doc.slideCount - 1,
    elements: doc.elements
      .filter((el) => slideOf(el, width, doc.slideCount) !== index)
      .map((el) => (slideOf(el, width, doc.slideCount) > index ? { ...el, x: el.x - width } : el)),
  };
}

/** Swaps slide `index` with its neighbour (`direction` -1 = left, +1 = right). */
export function moveSlide(doc: ProjectDoc, index: number, direction: -1 | 1): ProjectDoc {
  const target = index + direction;
  if (target < 0 || target >= doc.slideCount) return doc;
  const { width } = SLIDE_SIZE[doc.ratio];
  return {
    ...doc,
    elements: doc.elements.map((el) => {
      const s = slideOf(el, width, doc.slideCount);
      if (s === index) return { ...el, x: el.x + direction * width };
      if (s === target) return { ...el, x: el.x - direction * width };
      return el;
    }),
  };
}
