import Outcall "http-outcalls/outcall";
import Text "mo:core/Text";

actor {
  public query func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  public func fetchUrl(url : Text) : async Text {
    try {
      await Outcall.httpGetRequest(url, [], transform);
    } catch (_) {
      "";
    };
  };
};
