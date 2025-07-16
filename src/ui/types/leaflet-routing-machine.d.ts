import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Routing {
    interface ControlOptions {
      waypoints?: L.LatLngExpression[];
      routeWhileDragging?: boolean;
      showAlternatives?: boolean;
      addWaypoints?: boolean;
      fitSelectedRoutes?: boolean;
      show?: boolean;
    }

    class Control extends L.Control {
      constructor(options?: ControlOptions);
      setWaypoints(waypoints: L.LatLngExpression[]): void;
      spliceWaypoints(index: number, howMany: number, ...latlngs: L.LatLng[]): void;
      getWaypoints(): L.Routing.Waypoint[];
      on(type: string, fn: (e: any) => void, context?: any): L.Routing.Control;
      off(type: string, fn?: (e: any) => void, context?: any): L.Routing.Control;
    }

    interface Waypoint {
      latLng: L.LatLng;
      name?: string;
      options?: any;
    }

    function control(options?: ControlOptions): Control;
  }

  namespace routing {
    function control(options?: Routing.ControlOptions): Routing.Control;
  }
}