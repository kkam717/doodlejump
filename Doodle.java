package doodlejump;

import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;

/**
 * The doodle class is our player shape class. This class handles instantiation of the shapes, the collision
 * detection with platforms, and accessor/mutator methods necessary to handle the doodle.
 */
public class Doodle {
    private final Rectangle mainBody;
    private double velocityY;

    public Doodle(Pane playerPane) { // associated playerPane with Doodle
        this.mainBody = new Rectangle(Constants.DOODLE_WIDTH, Constants.DOODLE_HEIGHT);
        this.setupShapes();

        playerPane.getChildren().addAll(this.mainBody);
        // getChildren method is used to get the components(such as mainBody) in container.
        this.moveDoodle(Constants.DOODLE_START_X, Constants.DOODLE_START_Y);
        this.setVelocity(0); // of index 0, the base platform
    }

    /**
     * Instead of the constructor, we set the position and color of the doodle in this helper method.
     */
    private void setupShapes() {
        this.setPos(Constants.ROOT_CENTER_X, Constants.ROOT_CENTER_Y);
        this.mainBody.setFill(Constants.DOODLE_COLOR);
        this.mainBody.setStroke(Color.BLACK);
    }

    /**
     * This mutator method sets the x and y location of the doodle.
     */
    public void setPos(double x, double y) {
        this.mainBody.setX(x - Constants.DOODLE_WIDTH / 2);
        this.mainBody.setY(y - Constants.DOODLE_HEIGHT / 2);
    }

    public void moveDoodle(double x, double y) {
        this.setPos(this.getCenterX() + x, this.getCenterY() + y);
    }

    /**
     * This accessor method the doodle's x-location returns the given x-location.
     */
    public double getCenterX() {
        return this.mainBody.getX() + Constants.DOODLE_WIDTH / 2;
    }

    public double getCenterY() {
        return this.mainBody.getY() + Constants.DOODLE_HEIGHT / 2;
    }

    /**
     * This helper method updates doodle's y-location.
     */
    public void updateY(double refresh) {
        this.moveDoodle(0, velocityY / refresh);
    }

    /**
     * This mutator method assigns the y velocity of doodle to a local variable called newVelocity .
     */
    public void setVelocity(double newVelocity) {
        this.velocityY = newVelocity;
    }

    public double getVelocityY() {
        return velocityY;
    }


    /**
     * Returns true only when the doodle is falling and lands on top of a platform.
     */
    public boolean collisionDetection(Platform platform) {
        if (this.velocityY <= 0) {
            return false;
        }
        if (!this.mainBody.getBoundsInParent().intersects(platform.getBoundsInParent())) {
            return false;
        }

        double playerBottom = this.getCenterY() + Constants.DOODLE_HEIGHT / 2.0;
        double platformTop = platform.getCenterY() - Constants.PLATFORM_HEIGHT / 2.0;
        double playerLeft = this.getCenterX() - Constants.DOODLE_WIDTH / 2.0;
        double playerRight = this.getCenterX() + Constants.DOODLE_WIDTH / 2.0;
        double platformLeft = platform.getCenterX() - Constants.PLATFORM_WIDTH / 2.0;
        double platformRight = platform.getCenterX() + Constants.PLATFORM_WIDTH / 2.0;

        boolean horizontalOverlap = playerRight > platformLeft && playerLeft < platformRight;
        boolean landingOnTop = playerBottom >= platformTop && this.getCenterY() <= platform.getCenterY();
        return horizontalOverlap && landingOnTop;
    }

    public void snapToPlatformTop(Platform platform) {
        double y = platform.getCenterY() - Constants.PLATFORM_HEIGHT / 2.0 - Constants.DOODLE_HEIGHT / 2.0;
        this.setPos(this.getCenterX(), y);
    }
}
