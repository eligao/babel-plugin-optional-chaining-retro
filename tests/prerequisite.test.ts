import get from "dlv";

const obj = {
  a: 1,
  b: {
    c: 2,
    n: null,
    d: {
      e: 3,
      f: {
        g: 4,
      },
    },
  },
};
describe("prerequisite tests between get() and optional chaining", () => {
  it("should be consistent on successful elems", () => {
    const getVal = get(obj, "b.c");
    const ocVal = obj.b?.c;
    expect(ocVal).toEqual(getVal);
  });

  it("should be consistent on undefined elems", () => {
    const getVal = get(obj, "b.d");
    const ocVal = obj.b?.d;
    expect(ocVal).toEqual(getVal);
  });

  it("should be consistent on nested elems", () => {
    const getVal = get(get(obj, "b.d").f, "g");
    const ocVal = obj.b?.d.f?.g;
    expect(ocVal).toEqual(getVal);
  });

  it("should be consistent on null paths", () => {
    const getVal = get(obj, "b.n.x");
    // @ts-ignore
    const ocVal = obj.b?.n?.x;
    expect(ocVal).toEqual(getVal);
  });

  it("should be consistent on null objects", () => {
    // @ts-ignore
    const getVal = get(null, "b.n");
    // @ts-ignore
    const ocVal = null?.b?.n;
    expect(ocVal).toEqual(getVal);
  });
});
