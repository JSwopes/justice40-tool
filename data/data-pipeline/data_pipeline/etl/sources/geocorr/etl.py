import pandas as pd

from data_pipeline.config import settings
from data_pipeline.etl.base import ExtractTransformLoad, ValidGeoLevel
from data_pipeline.utils import (
    get_module_logger,
    unzip_file_from_url,
)

logger = get_module_logger(__name__)


class GeoCorrETL(ExtractTransformLoad):
    NAME = "geocorr"
    GEO_LEVEL: ValidGeoLevel = ValidGeoLevel.CENSUS_TRACT
    PUERTO_RICO_EXPECTED_IN_DATA = False

    def __init__(self):
        self.OUTPUT_PATH = self.DATA_PATH / "dataset" / "geocorr"

        # Need to change hyperlink to S3

        # Note, that this CSV was generated by this notebook:
        # https://github.com/usds/justice40-tool/blob/main/data/data-pipeline/data_pipeline/ipython/urban_vs_rural.ipynb
        # The source data for this notebook was downloaded from GeoCorr;
        # the instructions for generating the source data is here:
        # https://github.com/usds/justice40-tool/issues/355#issuecomment-920241787
        self.GEOCORR_PLACES_URL = "https://justice40-data.s3.amazonaws.com/data-sources/geocorr_urban_rural.csv.zip"
        self.GEOCORR_GEOID_FIELD_NAME = "GEOID10_TRACT"
        self.URBAN_HEURISTIC_FIELD_NAME = "Urban Heuristic Flag"
        self.COLUMNS_TO_KEEP = [
            self.GEOID_TRACT_FIELD_NAME,
            self.URBAN_HEURISTIC_FIELD_NAME,
        ]

        self.df: pd.DataFrame

    def extract(self) -> None:
        logger.info(
            "Starting to download 2MB GeoCorr Urban Rural Census Tract Map file."
        )
        unzip_file_from_url(
            file_url=settings.AWS_JUSTICE40_DATASOURCES_URL
            + "/geocorr_urban_rural.csv.zip",
            download_path=self.get_tmp_path(),
            unzipped_file_path=self.get_tmp_path(),
        )

        self.df = pd.read_csv(
            filepath_or_buffer=self.get_tmp_path() / "geocorr_urban_rural.csv",
            dtype={
                self.GEOCORR_GEOID_FIELD_NAME: "string",
            },
            low_memory=False,
        )

    def transform(self) -> None:
        logger.info("Starting GeoCorr Urban Rural Map transform")
        # Put in logic from Jupyter Notebook transform when we switch in the hyperlink to Geocorr

        self.output_df = self.df.rename(
            columns={
                "urban_heuristic_flag": self.URBAN_HEURISTIC_FIELD_NAME,
            },
        )
