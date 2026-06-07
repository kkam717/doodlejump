package doodlejump;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;

/**
 In the App class, we created the scene (the window) of our DoodleJump application. We created a start method, in
 which PaneOrganizer and Scene were instantiated. We passed in a getter method for root so all the written methods
 and shapes in the pane can be shown within a constant boundary of unit pixels. We set the title of the window as
 an ode to the British version of DoodleJump.
 */
public class App extends Application {

    @Override
    public void start(Stage stage) {
        PaneOrganizer organizer = new PaneOrganizer();
        Scene scene = new Scene(organizer.getRoot(), Constants.ROOT_WIDTH, Constants.ROOT_HEIGHT);
        stage.setScene(scene);
        stage.setTitle("DoodleHopHop");
        stage.show();
    }

    public static void main(String[] argv) {
        launch(argv);
    }
}
