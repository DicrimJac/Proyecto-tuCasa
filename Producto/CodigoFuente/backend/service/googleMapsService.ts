const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");

export class GoogleMapsService {
    private apiKey: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || GOOGLE_MAPS_API_KEY;
    }

    async geocodeAddress(direccion: string) {
        const url =
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direccion)}&key=${this.apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK" || !data.results?.[0]) {
            throw new Error(`Dirección no encontrada: ${direccion}`);
        }

        const location = data.results[0].geometry.location;

        return {
            lat: location.lat,
            lng: location.lng,
            formattedAddress: data.results[0].formatted_address,
        };
    }

    private calcularDistancia(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371;

        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;

        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }

    async buscarPorTipo(
        lat: number,
        lng: number,
        tipo: string,
        radio: number = 1000
    ) {
        const url =
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radio}&type=${tipo}&key=${this.apiKey}`;

        const response = await fetch(url);
        const data = await response.json();
        data.results?.slice(0, 5).forEach((p: any) => {
            console.log("-", p.name);
        });

        return data.results || [];
    }

    async obtenerContextoSector(
        direccion: string,
        radio: number = 1000
    ) {
        try {
            const { lat, lng, formattedAddress } =
                await this.geocodeAddress(direccion);

            const [
                hospitales,
                colegios,
                parques,
                restaurantes,
                farmacias,
                supermercados,
                gimnasios,
                estacionesMetro
            ] = await Promise.all([
                this.buscarPorTipo(lat, lng, "hospital", radio),
                this.buscarPorTipo(lat, lng, "school", radio),
                this.buscarPorTipo(lat, lng, "park", radio),
                this.buscarPorTipo(lat, lng, "restaurant", radio),
                this.buscarPorTipo(lat, lng, "pharmacy", radio),
                this.buscarPorTipo(lat, lng, "supermarket", radio),
                this.buscarPorTipo(lat, lng, "gym", radio),
                this.buscarPorTipo(lat, lng, "subway_station", radio)
            ]);

            const resumenSector = {
                hospitales: hospitales.slice(0, 5).map((x: any) => x.name),
                colegios: colegios.slice(0, 5).map((x: any) => x.name),
                parques: parques.slice(0, 5).map((x: any) => x.name),
                restaurantes: restaurantes.slice(0, 5).map((x: any) => x.name),
                farmacias: farmacias.slice(0, 5).map((x: any) => x.name),
                supermercados: supermercados.slice(0, 5).map((x: any) => x.name),
                gimnasios: gimnasios.slice(0, 5).map((x: any) => x.name)
            };

            const metroMasCercano =
                estacionesMetro.length > 0
                    ? estacionesMetro
                        .map((e: any) => ({
                            nombre: e.name,
                            distancia: this.calcularDistancia(
                                lat,
                                lng,
                                e.geometry.location.lat,
                                e.geometry.location.lng
                            )
                        }))
                        .sort((a: any, b: any) => a.distancia - b.distancia)[0]
                    : null;

            let perfilSector = "Residencial";

            if (estacionesMetro.length >= 3) {
                perfilSector = "Alta conectividad";
            }
            else if (
                colegios.length >= 5 &&
                parques.length >= 5
            ) {
                perfilSector = "Familiar";
            }
            else if (
                restaurantes.length >= 10 ||
                supermercados.length >= 5
            ) {
                perfilSector = "Comercial";
            }           

            return {
                exito: true,
                direccion: formattedAddress,
                coordenadas: { lat, lng },

                indicadores: {
                    perfilSector,
                    resumenSector,
                    metroMasCercano
                }
            };
        } catch (error) {
            console.error("Error en Google Maps:", error);

            return {
                exito: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Error desconocido",
            };
        }
    }
}