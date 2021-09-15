import * as React from 'react';
import {useIntl} from 'gatsby-plugin-intl';
import {defineMessages} from 'react-intl';

import J40Map from '../J40Map';

import * as styles from './mapWrapper.module.scss';
import * as constants from '../../data/constants';
import AlertWrapper from '../AlertWrapper';

interface IMapWrapperProps {
  location: Location
}

const MapWrapper = ({location}: IMapWrapperProps) => {
  const intl = useIntl();
  const messages = defineMessages({
    downloadLinkText: {
      id: 'mapwrapper.download.link',
      defaultMessage: 'Download the draft list of communities of focus and datasets used.',
      description: 'download link for datasets',
    },
    downloadContents: {
      id: 'mapwrapper.download.contents',
      defaultMessage: 'ZIP file will contain one .xlsx, one .csv, and one .pdf (30 MB).',
      description: 'download link contents',
    },
  });
  return (
    <>
      <AlertWrapper showBetaAlert={false} showLimitedDataAlert={true}/>
      <J40Map location={location}/>
      <div className={styles.mapCaptionTextLink}>
        <a href={constants.DOWNLOAD_ZIP_URL}>
          {intl.formatMessage(messages.downloadLinkText)}
        </a>
      </div>
      <div>{intl.formatMessage(messages.downloadContents)}</div>
    </>
  );
};


export default MapWrapper;