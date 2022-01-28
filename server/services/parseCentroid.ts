export default function (json) {
  return {
    type: json.type,
    lat: json.coordinates[0],
    lon: json.coordinates[1],
  };
}
