/* eslint-disable indent */
/* eslint-disable no-unused-vars */
import React, {useMemo} from 'react';
import {Source, Layer} from 'react-map-gl';
import {AnyLayer} from 'mapbox-gl';

// Contexts:
import {useFlags} from '../../contexts/FlagContext';

import * as constants from '../../data/constants';
import * as COMMON_COPY from '../../data/copy/common';

interface IMapTractLayers {
    selectedFeatureId: AnyLayer,
    selectedFeature: AnyLayer,
}

/**
 * This function will determine the URL for the map tiles. It will read in a string that will designate either
 * high or low tiles. It will allow to overide the URL to the pipeline staging tile URL via feature flag.
 * Lastly, it allows to set the tiles to be local or via the CDN as well.
 *
 * @param {string} tilesetName
 * @return {string}
 */
export const featureURLForTilesetName = (tilesetName: string): string => {
  const flags = useFlags();

  const pipelineStagingBaseURL = `https://justice40-data.s3.amazonaws.com/data-pipeline-staging`;
  const XYZ_SUFFIX = '{z}/{x}/{y}.pbf';

  if ('stage_hash' in flags) {
    // Check if the stage_hash is valid
    const regex = /^[0-9]{4}\/[a-f0-9]{40}$/;
    if (!regex.test(flags['stage_hash'])) {
      console.error(COMMON_COPY.CONSOLE_ERROR.STAGE_URL);
    }

    return `${pipelineStagingBaseURL}/${flags['stage_hash']}/data/score/tiles/${tilesetName}/${XYZ_SUFFIX}`;
  } else {
    // The feature tile base URL and path can either point locally or the CDN.
    // This is selected based on the DATA_SOURCE env variable.
    const featureTileBaseURL = process.env.DATA_SOURCE === 'local' ?
        process.env.GATSBY_LOCAL_TILES_BASE_URL :
        process.env.GATSBY_CDN_TILES_BASE_URL;

    const featureTilePath = process.env.DATA_SOURCE === 'local' ?
      process.env.GATSBY_DATA_PIPELINE_SCORE_PATH_LOCAL :
      process.env.GATSBY_1_0_SCORE_PATH;

    return [
      featureTileBaseURL,
      featureTilePath,
      process.env.GATSBY_MAP_TILES_PATH,
      tilesetName,
      XYZ_SUFFIX,
    ].join('/');
  }
};

/**
 * This component will return the appropriate source and layers for the census layer on the
 * map.
 *
 * There are two use cases here, eg, when the MapBox token is or isn't provided. When the token
 * is not provided, the open-source map will be rendered. When the open-source map is rendered
 * only the interactive layers are returned from this component. The reason being is that the
 * other layers are supplied by he getOSBaseMap function.
 *
 * @param {AnyLayer} selectedFeatureId
 * @param {AnyLayer} selectedFeature
 * @return {Style}
 */
const MapTractLayers = ({
  selectedFeatureId,
  selectedFeature,
}: IMapTractLayers) => {
  const filter = useMemo(() => ['in', constants.GEOID_PROPERTY, selectedFeatureId], [selectedFeature]);

  return process.env.MAPBOX_STYLES_READ_TOKEN ? (

    // In this case the MapBox token is found and All source(s)/layer(s) are returned.
    <>

    </>
  ): (

    /**
     * In this case the MapBox token is NOT found and ONLY interactive source(s)/layer(s) are returned
     * In this case, the other layers (non-interactive) are provided by getOSBaseMap
     */
    <>
   <Source
      id="myTilesetSource"
      type="vector"
      url="mapbox://jksdachief.bt31fi4l"
    >
      {/* Add a layer for your tileset */}
      <Layer
        id="myTilesetLayer"
        type="symbol" // Change the type based on your data (e.g., 'line', 'circle', 'symbol')
        source="myTilesetSource"
        source-layer={constants.SCORE_SOURCE_LAYER} // Replace with your source layer name
        layout={{
          'icon-image': 'marker-15', // Use an icon from Mapbox's standard icon set or your custom icon
          'text-field': '{fieldName}', // Replace with your field name for labels
          'text-offset': [0, 0.6],
          'text-anchor': 'top',
        }}

      />
    </Source>

    <Source
      id={constants.HIGH_ZOOM_SOURCE_NAME}
      type='vector'
      promoteId={constants.GEOID_PROPERTY}
      tiles={[featureURLForTilesetName('high')]}
      maxzoom={constants.GLOBAL_MAX_ZOOM_HIGH}
      minzoom={constants.GLOBAL_MIN_ZOOM_HIGH}
    >

      {/* High zoom layer (dynamic) - border styling around the selected feature */}
      <Layer
        id={constants.SELECTED_FEATURE_BORDER_LAYER_ID}
        source-layer={constants.SCORE_SOURCE_LAYER}
        filter={filter} // This filter filters out all other features except the selected feature.
        type='line'
        paint={{
          'line-color': constants.SELECTED_FEATURE_BORDER_COLOR,
          'line-width': constants.SELECTED_FEATURE_BORDER_WIDTH,
        }}
        minzoom={constants.GLOBAL_MIN_ZOOM_HIGH}
      />
    </Source>
    </>
  );
};

export default MapTractLayers;
