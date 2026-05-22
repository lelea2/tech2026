import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Algorithm',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Practice patterns such as two pointers, binary search, graph traversal,
        and dynamic programming with clear trade-off analysis.
      </>
    ),
    cta: 'Explore Algorithm',
  },
  {
    title: 'System Design',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Learn to structure scalable systems, define requirements, estimate
        capacity, and justify architectural choices during interviews.
      </>
    ),
    cta: 'Explore System Design',
  },
  {
    title: 'Behavioral Interview',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Build strong STAR responses, communicate impact clearly, and prepare for
        leadership and collaboration questions with confidence.
      </>
    ),
    cta: 'Explore Behavioral',
  },
];

function Feature({Svg, title, description, cta}) {
  return (
    <article className={clsx('col col--4', styles.featureCard)}>
      <div className={styles.featureIconWrap}>
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className={styles.featureBody}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <Link className="button button--primary button--sm" to="/docs/frontend">
          {cta}
        </Link>
      </div>
    </article>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Preparation Tracks</Heading>
          <p>Choose a core track and level up one interview skill at a time.</p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
