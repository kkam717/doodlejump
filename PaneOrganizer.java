package doodlejump;

import javafx.event.ActionEvent;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.Background;
import javafx.scene.layout.BackgroundFill;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.CornerRadii;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;

import java.io.File;

/**
 * This is our PaneOrganizer, top-level graphical class. Here we create instances of root, playerPane, scoreLabel,
 * highScoreLabel, and buttonPane. In the constructor, we initialized these variables, set the text of the labels,
 * added the backgroundImage to root and set the position of the playerPane. This is class is used to organize our
 * graphical panes and graph-paper-like background image.
 */
public class PaneOrganizer {
    private final BorderPane root;
    private final Pane playerPane;
    private final Label scoreLabel;
    private final Label highScoreLabel;
    private final HBox buttonPane;

    public PaneOrganizer() {
        this.root = new BorderPane();
        this.scoreLabel = new Label("Score: 0");
        this.highScoreLabel = new Label("High Score : 0");
        this.buttonPane = new HBox();
        this.backgroundImage(root);
        this.playerPane = new Pane();
        new DoodleJump(this.playerPane, this.scoreLabel,
                this.buttonPane, this.highScoreLabel); // initialized the DoodleJump game
        this.root.setCenter(this.playerPane); // set playerPane to center of root.
        this.createButtonPane(this.buttonPane); // initialized createButtonPane method
    }

    /**
     * We create a backgroundImage method so that we can add an image to the BorderPane. This is done by instantiating
     * a new image and getting its location from the computer system, or in our case just the cartoon folder in
     * intelliJ. Need to call getChildren so that the image can be added as a component of the BorderPane.
     * @param root
     */
    public void backgroundImage(Pane root) {
        File backgroundFile = new File("background.png");
        Image image = backgroundFile.exists()
                ? new Image(backgroundFile.toURI().toString(), false)
                : null;
        if (image != null && !image.isError()) {
            ImageView iv = new ImageView(image);
            root.getChildren().add(iv);
            iv.setFitWidth(Constants.ROOT_WIDTH);
            iv.setFitHeight(Constants.ROOT_HEIGHT);
            iv.toBack();
        } else {
            root.setBackground(new Background(new BackgroundFill(Color.web("#FFF8DC"), CornerRadii.EMPTY, null)));
        }
    }

    /**
     * Here we make a createButtonPane method so that the BoarderPane can add the buttonPane. What's important to note
     * here is that we instantiate a new button in the buttonPane, the quit button. The ActionEvent handles the exit
     * execution when the user interacts with this button. Called getChildren() so that quit button can be added to
     * the buttonPane. We did the same with the restart button.
     *
     * @param buttonPane
     */
    private void createButtonPane(HBox buttonPane) {
        this.buttonPane.setPrefSize(Constants.BUTTON_PANE_WIDTH, Constants.BUTTON_PANE_HEIGHT);
        this.buttonPane.setStyle(Constants.BUTTON_PANE_COLOR);
        this.buttonPane.setSpacing(Constants.SCORE_OFFSET);

        Button quitButton = new Button("Quit");
        this.buttonPane.getChildren().add(quitButton);
        this.root.setBottom(buttonPane);
        quitButton.setOnAction((ActionEvent e) -> System.exit(0)); // lambda statement so program actually closes.
        this.buttonPane.setAlignment(Pos.CENTER);

        this.buttonPane.getChildren().addAll(this.scoreLabel);

        this.buttonPane.setFocusTraversable(false);
        quitButton.setFocusTraversable(false);
    }

    /**
     * This accessor method returns root of type BorderPane.
     */
    public BorderPane getRoot() {
        return this.root;
    }
}
