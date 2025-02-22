import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

import { LearningHeader as Header } from '@edx/frontend-component-header';
import Footer from '@edx/frontend-component-footer';
import { Spinner } from '@edx/paragon';

import { getCohorts, getCourseHomeCourseMetadata } from './data/api';

import './PageContainer.scss';

export const CourseMetadataContext = React.createContext();

export default function PageContainer(props) {
  const { children } = props;
  const { courseId } = useParams();

  const [courseMetadata, setCourseMetadata] = useState();

  useEffect(() => {
    async function fetchCourseMetadata() {
      let metadataResponse;
      let cohortsResponse;

      try {
        metadataResponse = await getCourseHomeCourseMetadata(courseId);
        cohortsResponse = await getCohorts(courseId);
      } catch (e) {
        setCourseMetadata({
          org: '',
          number: '',
          title: '',
          originalUserIsStaff: false,
          tabs: [],
          cohorts: [],
        });
        return;
      }

      const {
        org, number, title, tabs, originalUserIsStaff,
      } = metadataResponse;
      const { cohorts } = cohortsResponse;

      setCourseMetadata({
        org,
        number,
        title,
        originalUserIsStaff,
        tabs: [...tabs],
        cohorts: cohorts.map(({ name }) => name),
      });
    }
    fetchCourseMetadata();
  }, []);

  if (courseMetadata) {
    return (
      <CourseMetadataContext.Provider value={courseMetadata}>
        <>
          <Header
            className="learning-header"
            courseOrg={courseMetadata.org}
            courseNumber={courseMetadata.number}
            courseTitle={courseMetadata.title}
          />
          <main>
            {children}
          </main>
          <Footer />
        </>
      </CourseMetadataContext.Provider>
    );
  }

  return (
    <div className="d-flex justify-content-center">
      <Spinner
        animation="border"
        variant="primary"
        role="status"
        screenreadertext="loading"
        className="spinner-border spinner-border-lg text-primary p-5 m-5"
      />
    </div>
  );
}

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
};
