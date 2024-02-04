import { features } from "../constants/constants";
import styles, { layout } from "../style";
import Button from "./Button";
import Card from "./Card";
import { feedback } from "../constants/constants";

function Testimonials() {
  return (
    <section
      id="features"
      className={layout.section}
      style={{ backgroundColor: "black" }}
    >
      <div className={layout.sectionInfo}>
        <h2 className={styles.heading2}>Our Team</h2>

        <div className="flex  sm:justify-start justify-center w-full feedback-container relative z-[1]">
          {feedback.map((card) => (
            <Card key={card.id} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
