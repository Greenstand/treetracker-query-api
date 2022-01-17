import parseCentroid from "./parseCentroid";

describe("parseCentroid", () =>{
  it("successfully", () => {
    const result = parseCentroid(JSON.parse('{\"type\":\"Point\",\"coordinates\":[-11.7927124667898,8.56329593037589]}'))
    expect(result).toMatchObject({
      type: 'Point',
      lat: expect.any(Number),
      lon: expect.any(Number),
    })
  })
})